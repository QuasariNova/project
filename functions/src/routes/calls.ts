import express, { Response } from "express";
import { RpcResponse } from "../types/types";
import functions from "../services/fn";
import { isValidRpcRequest } from "../utils/utils";

const router = express.Router();

router.use(express.json());

router.post("/", (req, res: Response<RpcResponse>) => {
  if (!isValidRpcRequest(req.body)) {
    if (
      !!req.body &&
      typeof req.body === "object" &&
      "id" in req.body &&
      (typeof req.body.id === "string" || typeof req.body.id === "number")
    ) {
      return res.status(400).json({
        error: "Not a valid JSON RPC request format",
        id: req.body.id,
      });
    }

    return res.status(400).send();
  }

  const { id, method, params } = req.body;
  const fn = functions.getFunction(method);
  let body: RpcResponse | undefined = undefined;

  if (!fn) {
    if (id) {
      body = { error: `Method ${method} does not exist.`, id };
    }

    return res.status(404).json(body);
  }

  try {
    fn.fn(params.event);
    const result = undefined;
    if (id) {
      body = { result, id };
    }
  } catch (e) {
    if (id && (e instanceof Error || typeof e === "string")) {
      body = { error: e, id };
    }
  }
  return res.status(200).json(body);
});

export default router;
