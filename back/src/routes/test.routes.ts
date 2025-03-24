// File: back/src/routes/test.routes.ts
import express from "express";

const router = express.Router();

interface Params {
  id: string;
}
interface Req {
  params: Params;
}
interface Res {
  json: (data: any) => void;
  status: (code: number) => Res;
}

router.get("/test/:id", (req: Req, res: Res) => {
  const id = req.params.id;
  res.json({ id });
});

export default router;