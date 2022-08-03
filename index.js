import { SMTPServer } from "smtp-server";
import { simpleParser } from "mailparser";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import path from "path";
import fs from "fs/promises";
import config from "./config.json" assert { type: "json" };

function log(message) {
    console.log(message);
}

function scheduleForDeletion(directory) {
    setTimeout(async () => {
        await fs.rm(directory, { recursive: true });
        log(`[Deletion scheduler] Deleted ${directory}`);
    }, config.deletionTimeout * 1000 * 60);
}

const smtpServer = new SMTPServer({
    authOptional: true,
    maxAllowedUnauthenticatedCommands: Infinity,
    async onData(stream, session, callback) {
        try {
            const id = uuidv4();

            const parsedEmail = await simpleParser(stream);
            const toAddress = parsedEmail.to?.value?.[0].address;

            if (!toAddress) {
                throw "Sender address missing";
            }

            const addressDirectory = path.join("mails", path.normalize(toAddress));
            await fs.mkdir(addressDirectory, { recursive: true });

            const manifestFilePath = path.join(addressDirectory, "manifest.json");
            let manifest;
            try {
                manifest = JSON.parse((await fs.readFile(manifestFilePath)).toString());
            } catch (err) {
                manifest = [];
            }
            manifest.unshift({ id });
            await fs.writeFile(manifestFilePath, JSON.stringify(manifest));

            const mailDirectory = path.join(addressDirectory, id);
            await fs.mkdir(mailDirectory);

            const attachmentsDirectory = path.join(mailDirectory, "attachments");
            await fs.mkdir(attachmentsDirectory);

            const attachments = [];
            for (const a of parsedEmail.attachments) {
                if (a.size > (config.maxAttachmentSize * 1000000)) {
                    continue;
                }

                const attachmentId = uuidv4();
                const attachmentName = a.filename;
                const attachmentPath = path.join(attachmentsDirectory, path.normalize(attachmentName));

                await fs.writeFile(attachmentPath, a.content);

                attachments.push({
                    id: attachmentId,
                    fileName: attachmentName
                });
            }

            const mailData = {
                id,
                from: {
                    address: parsedEmail.from?.value?.[0]?.address,
                    name: parsedEmail.from?.value?.[0].name
                },
                to: {
                    address: parsedEmail.to?.value?.[0].address,
                    name:  parsedEmail.to?.value?.[0].name
                },
                subject: parsedEmail.subject,
                date: parsedEmail.date,
                body: {
                    text: parsedEmail.text,
                    html: parsedEmail.html || ""
                },
                headers: parsedEmail.headers,
                attachments
            }

            const mailDataFile = path.join(mailDirectory, "mail.json");
            await fs.writeFile(mailDataFile, JSON.stringify(mailData));

            scheduleForDeletion(mailDirectory);
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

webServer.get("/api/v1/domains", (req, res) => {
    res.json(config.domains);
});

webServer.get("/api/v1/mail/:address", async (req, res) => {
    try {
        let limit = 10;
        if (req.query.limit && !isNaN(parseInt(req.query.limit)) && parseInt(limit) <= 10) {
            limit = parseInt(req.query.limit);
        }

        const mailDirectory = path.join(config.mailDirectory, path.normalize(req.params.address));
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

webServer.get("/api/v1/mail/:address/:mailId", async (req, res) => {
    try {
        const mailFile = path.join(config.mailDirectory, path.normalize(req.params.address), path.normalize(req.params.mailId), "mail.json");
        const mail = JSON.parse((await fs.readFile(mailFile)).toString());

        res.json(mail);
    } catch (err) {
        res.status(404);
        res.end();
    }
});

webServer.get("/api/v1/mail/:address/:mailId/attachments", async (req, res) => {
    try {
        const mailFile = path.join(config.mailDirectory, path.normalize(req.params.address), path.normalize(req.params.mailId), "mail.json");
        const mail = JSON.parse((await fs.readFile(mailFile)).toString());

        res.json(mail.attachments);
    } catch (err) {
        res.status(404);
        res.end();
    }
});

webServer.get("/api/v1/mail/:address/:mailId/attachments/:attachmentId", async (req, res) => {
    try {
        const mailDirectory = path.join(config.mailDirectory, path.normalize(req.params.address), path.normalize(req.params.mailId));
        const mailFile = path.join(mailDirectory, "mail.json");
        const mail = JSON.parse((await fs.readFile(mailFile)).toString());

        const attachment = mail.attachments.find(a => a.id === req.params.attachmentId);
        if (!attachment) {
            throw "Attachment not found";
        }

        const attachmentFile = path.join(mailDirectory, "attachments", path.normalize(attachment.fileName));

        res.download(attachmentFile);
    } catch (err) {
        res.status(404);
        res.end();
    }
});

webServer.delete("/api/v1/mail/:address/:mailId", async (req, res) => {
    try {
        const addressDirectory = path.join(config.mailDirectory, path.normalize(req.params.address));
        const mailDirectory = path.join(addressDirectory, path.normalize(req.params.mailId));
        const manifestFile = path.join(addressDirectory, "manifest.json");

        const manifest = JSON.parse((await fs.readFile(manifestFile)).toString())
            .filter(m => m.id !== req.params.mailId);
        await fs.writeFile(manifestFile, JSON.stringify(manifest));
        
        await fs.rm(mailDirectory, { recursive: true });

        res.sendStatus(204);
        res.end();
    } catch (err) {
        res.status(404);
        res.end();
    }
});


webServer.delete("/api/v1/mail/:address", async (req, res) => {
    try {
        const mailDirectory = path.join(config.mailDirectory, path.normalize(req.params.address));

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