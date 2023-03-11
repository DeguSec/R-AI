import { commands } from "../Commands/_Commands";
import { CommonComponents } from "./_Listeners";

export const ClientReady = async (cc: CommonComponents) => {
    console.log("Ready");
    await cc.client.application?.commands.set(commands.map((command) => command.data));
}