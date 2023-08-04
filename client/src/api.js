const API_BASE = "/api/v1";

export async function getDomains() {
    const response = await fetch(`${API_BASE}/domains`);
    return await response.json();
}

export async function getRandomUsername() {
    const response = await fetch(`${API_BASE}/randomUsername`);
    return await response.json();
}

export async function getInbox(address, limit) {
    let uri = `${API_BASE}/mail/${address}`;
    if (limit) {
        uri += `&limit=${limit}`;
    }
    const response = await fetch(uri);
    return await response.json();
}

export async function deleteInbox(address) {
    await fetch(`${API_BASE}/mail/${address}`, {
        method: "DELETE"
    });
}

export async function deleteMail(address, emailId) {
    await fetch(`${API_BASE}/mail/${address}/${emailId}`, {
        method: "DELETE",
    }); 
}

export async function getContactEmail() {
    const response = await fetch(`${API_BASE}/contactEmail`);
    return await response.json();
}