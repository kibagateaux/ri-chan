import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";

import bookingServer from './bookingcom'

const initMCPs = async () => {
    const transport = new StdioServerTransport();
    Promise.all([
        bookingServer,
    ].map(s => s.connect(transport)))
}