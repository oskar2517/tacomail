import { SMTPServer } from "smtp-server";
import { simpleParser } from "mailparser";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import path from "path";
import fs from "fs/promises";
import config from "./config.json" assert { type: "json" };
import sanitize from "sanitize-filename";
import { pathExists } from "path-exists";
import { generateUsername } from "unique-username-generator";
import cors from "cors";

function log(message) {
    console.log(message);
}

function timestampToMinutes(timestamp) {
    return timestamp / 1000 / 60;
}

setInterval(async () => {
    try {
        const currentTime = timestampToMinutes(Date.now());
        const addressDirectories = await fs.readdir(config.mailDirectory);

        for (const address of addressDirectories) {
            const addressDirectory = path.join(config.mailDirectory, address);
            const manifestFile = path.join(addressDirectory, "manifest.json");
            const manifest = JSON.parse((await fs.readFile(manifestFile)).toString());

            const newManifest = [];
            for (const storedMail of manifest) {
                if (currentTime - timestampToMinutes(storedMail.timestamp) < config.deletionTimeout) {
                    newManifest.push(storedMail);
                    continue;
                }

                const storedMailDirectory = path.join(addressDirectory, storedMail.id);

                await fs.rm(storedMailDirectory, { recursive: true });
            }

            if (newManifest.length === 0) {
                await fs.rm(addressDirectory, { recursive: true });
            } else {
                await fs.writeFile(manifestFile, JSON.stringify(newManifest));
            }
        }
    } catch (err) {
        log(err);
    }
}, 30 * 1000);

const smtpServer = new SMTPServer({
    authOptional: true,
    maxAllowedUnauthenticatedCommands: Infinity,
    disabledCommands: ["STARTTLS"],
    secure: false,
    async onData(stream, session, callback) {
        try {
            const id = uuidv4();

            const parsedEmail = await simpleParser(stream);
            const toAddress = parsedEmail.to?.value?.[0].address;

            if (!toAddress) {
                throw "Sender address missing";
            }

            const addressDirectory = path.join("mails", sanitize(toAddress));
            await fs.mkdir(addressDirectory, { recursive: true });

            const manifestFilePath = path.join(addressDirectory, "manifest.json");
            let manifest;
            try {
                manifest = JSON.parse((await fs.readFile(manifestFilePath)).toString());
            } catch (err) {
                manifest = [];
            }
            manifest.unshift({ id, timestamp: Date.now() });
            await fs.writeFile(manifestFilePath, JSON.stringify(manifest));

            const mailDirectory = path.join(addressDirectory, id);
            await fs.mkdir(mailDirectory);

            const attachmentsDirectory = path.join(mailDirectory, "attachments");
            await fs.mkdir(attachmentsDirectory);

            const attachments = [];
            let savedAttachmentsSize = 0;
            for (const a of parsedEmail.attachments) {
                const attachmentId = uuidv4();
                const attachmentName = a.filename;

                const attachment = {
                    id: attachmentId,
                    fileName: attachmentName
                };

                savedAttachmentsSize += a.size;
                if (savedAttachmentsSize <= config.limitations.maxAttachmentsSize * 1_000_000) {
                    const attachmentPath = path.join(attachmentsDirectory, attachmentId);

                    await fs.writeFile(attachmentPath, a.content);
                    attachment.present = true;
                } else {
                    attachment.present = false;
                }

                attachments.push(attachment);
            }

            const mailData = {
                id,
                from: {
                    address: parsedEmail.from?.value?.[0]?.address?.substring(0, config.limitations.maxOthersChars),
                    name: parsedEmail.from?.value?.[0].name?.substring(0, config.limitations.maxOthersChars)
                },
                to: {
                    address: parsedEmail.to?.value?.[0].address?.substring(0, config.limitations.maxOthersChars),
                    name: parsedEmail.to?.value?.[0].name?.substring(0, config.limitations.maxOthersChars)
                },
                subject: parsedEmail.subject?.substring(0, config.limitations.maxTitleChars),
                date: parsedEmail.date?.toISOString().substring(0, config.limitations.maxOthersChars),
                body: {
                    text: parsedEmail.text?.substring(0, config.limitations.maxBodyChars) || "",
                    html: parsedEmail.html ? parsedEmail.html.substring(0, config.limitations.maxBodyChars) : ""
                },
                headers: new Map(
                    Array.from(parsedEmail.headers, ([key, value]) => [
                        key.substring(0, config.limitations.maxOthersChars),
                        value.toString().substring(0, config.limitations.maxOthersChars)
                    ])
                ),
                attachments
            }

            const mailDataFile = path.join(mailDirectory, "mail.json");
            await fs.writeFile(mailDataFile, JSON.stringify(mailData));
        } catch (err) {
            log(err);
        }

        return callback();
    }
});

smtpServer.listen(config.smtpServer.port, () => {
    log(`[SMTP server] SMTP server running on port ${config.smtpServer.port}`);
});

const webServer = express();
webServer.use(express.static("client/public"));

webServer.get("/api/v1/contactEmail", cors(), (req, res) => {
    res.json({ email: config.contactEmail });
});

webServer.get("/api/v1/randomUsername", cors(), (req, res) => {
    const username = generateUsername("", 5, 20);

    res.json({ username });
});

webServer.get("/api/v1/domains", cors(), (req, res) => {
    res.json(config.domains);
});

webServer.get("/api/v1/mail/:address", cors(), async (req, res) => {
    try {
        let limit = 10;
        if (req.query.limit && !isNaN(parseInt(req.query.limit)) && parseInt(req.query.limit) <= 10) {
            limit = parseInt(req.query.limit);
        }

        const mailDirectory = path.join(config.mailDirectory, sanitize(req.params.address));
        const manifestFile = path.join(mailDirectory, "manifest.json");
        const manifest = JSON.parse((await fs.readFile(manifestFile)).toString()).slice(0, limit);

        const responseData = [];
        for (const m of manifest) {
            const mailFile = path.join(mailDirectory, m.id, "mail.json");
            const mail = JSON.parse((await fs.readFile(mailFile)).toString());
            responseData.push(mail);
        }

        res.json(responseData);
    } catch (err) {
        res.json([]);
    }
});

webServer.get("/api/v1/mail/:address/:mailId", cors(), async (req, res) => {
    try {
        const mailFile = path.join(config.mailDirectory, sanitize(req.params.address), sanitize(req.params.mailId), "mail.json");
        const mail = JSON.parse((await fs.readFile(mailFile)).toString());

        res.json(mail);
    } catch (err) {
        res.status(404);
        res.end();
    }
});

webServer.get("/api/v1/mail/:address/:mailId/attachments", cors(), async (req, res) => {
    try {
        const mailFile = path.join(config.mailDirectory, sanitize(req.params.address), sanitize(req.params.mailId), "mail.json");
        const mail = JSON.parse((await fs.readFile(mailFile)).toString());

        res.json(mail.attachments);
    } catch (err) {
        res.status(404);
        res.end();
    }
});

webServer.get("/api/v1/mail/:address/:mailId/attachments/:attachmentId", cors(), async (req, res) => {
    try {
        const mailDirectory = path.join(config.mailDirectory, sanitize(req.params.address), sanitize(req.params.mailId));
        const mailFile = path.join(mailDirectory, "mail.json");
        const mail = JSON.parse((await fs.readFile(mailFile)).toString());

        const attachment = mail.attachments.find(a => a.id === req.params.attachmentId);
        if (!attachment || !attachment.present) {
            throw "Attachment not found";
        }

        const attachmentFile = path.join(mailDirectory, "attachments", attachment.id);

        if (!(await pathExists(attachmentFile))) {
            throw "Attachment not found";
        }

        res.download(attachmentFile, attachment.fileName);
    } catch (err) {
        res.status(404);
        res.end();
    }
});

webServer.delete("/api/v1/mail/:address/:mailId", cors(), async (req, res) => {
    try {
        const addressDirectory = path.join(config.mailDirectory, sanitize(req.params.address));
        const mailDirectory = path.join(addressDirectory, sanitize(req.params.mailId));
        const manifestFile = path.join(addressDirectory, "manifest.json");

        const manifest = JSON.parse((await fs.readFile(manifestFile)).toString())
            .filter(m => m.id !== req.params.mailId);

        if (manifest.length === 0) {
            await fs.rm(addressDirectory, { recursive: true });
        } else {
            await fs.writeFile(manifestFile, JSON.stringify(manifest));
            await fs.rm(mailDirectory, { recursive: true });
        }

        res.sendStatus(204);
        res.end();
    } catch (err) {
        res.status(404);
        res.end();
    }
});


webServer.delete("/api/v1/mail/:address", cors(), async (req, res) => {
    try {
        const mailDirectory = path.join(config.mailDirectory, sanitize(req.params.address));

        await fs.rm(mailDirectory, { recursive: true });

        res.sendStatus(204);
        res.end();
    } catch (err) {
        res.status(404);
        res.end();
    }
});

webServer.listen(config.webServer.port, () => {
    log(`[Web server] Web server running on port ${config.webServer.port}`);
});