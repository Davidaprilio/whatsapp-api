import { Request, Response } from "express";

exports.index = (req: Request, res: Response) => {
  res.render("messages/index");
};

exports.create = (req: Request, res: Response) => {
  res.render("messages/create");
};

exports.store = (req: Request, res: Response) => {
  return res.json({
    body: req.body,
  });
};
