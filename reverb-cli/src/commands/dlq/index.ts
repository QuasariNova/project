import chalk from "chalk";
import { ApiCommand } from "../../api-command.js";
import { Flags } from "@oclif/core";

export default class Dlq extends ApiCommand<typeof Dlq> {
  static description =
    "Get dead letter queue items that have occured within a time period";

  static flags = {
    apiUrl: Flags.string({
      char: "u",
      description: "The url to the api gateway for this call",
      required: false,
    }),
    apiKey: Flags.string({
      char: "k",
      description: "API key that goes with the api url.",
      required: false,
    }),
    start: Flags.string({
      char: "s",
      description:
        "Start Time for logs to get in a javascript parsable format(Defaults to 7 day prior to end)",
      required: false,
    }),
    end: Flags.string({
      char: "e",
      description:
        "End Time for logs to get in a javascript parsable format(Defaults to now)",
      required: false,
    }),
  };

  async run(): Promise<void> {
    const url = this.getUrl();
    const key = this.getKey();

    const end = this.getEndTime();
    const start = this.getStartTime();

    let data: { logs: object[] };

    try {
      const res = await fetch(
        url + `/logs/dead-letter?limit=-1&startTime=${start}&endTime=${end}`,
        {
          headers: { "x-api-key": key },
        }
      );

      if (res.status === 500) {
        this.warn(
          `${chalk.red("[FAIL]")} Internal Server Error, try again later`
        );
        throw "error";
      }

      if (res.status === 403) {
        this.warn(
          `${chalk.red(
            "[FAIL]"
          )} API Key invalid, please provide correct API Key`
        );
        throw "error";
      }

      data = await res.json();
    } catch {
      this.error(`${chalk.red("[FAIL]")} Cannot connect to ${url}.`);
    }

    this.log(
      `${chalk.greenBright("[Success]")} Showing ${chalk.red(
        "dead letter items"
      )} from ${chalk.yellow(start)} to ${chalk.yellow(end)}:\n`
    );

    if (data.logs.length === 0) {
      this.warn("There are no dead letter items to show");
    }

    for (const log of data.logs) {
      this.logJson(log);
      this.log();
    }
  }
}
