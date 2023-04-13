import { commands } from "../Commands/_Commands";
import { CommonComponents } from "./_Listeners";

export const ClientReady = async (cc: CommonComponents) => {
    console.log("Ready");

    (async () => {
        await cc.client.application?.fetch();
        cc.id = cc.client.application?.id;
        console.log("App ID: " + cc.id);
    })()

    await cc.client.application?.commands.set(commands.map((command) => command.data));
}