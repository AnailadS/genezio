/**
* This is an auto generated code. This code should not be modified since the file can be overwriten 
* if new genezio commands are executed.
*/

async function makeRequest(request, url, port) {
    const response = await fetch(`${url}:${port}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });
    return response.json();
}

/**
 * The class through which all request to the Genezio backend will be passed.
 * 
 */
export class Remote {
    url = undefined
    port = 443

    constructor(url, port) {
        this.url = url
        this.port = port
    }

    async call(method, ...args) {
        const requestContent = {"jsonrpc": "2.0", "method": method, "params": args, "id": 3};
        const response = await makeRequest(requestContent, this.url, this.port);

        if (response.error) {
            return response.error.message;
        }

        return response.result;
    }
}