import { Request, Response } from "express";
import knex from "../database/connection";
import { QueryBuilder } from "knex";

class PointsController {
  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    const trx = await knex.transaction();

    const insertedIds = await trx("points").insert({
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    });

    const point_id = insertedIds[0];
    const parsedItems = items
      ? items.split(",").map((item: string) => Number(item.trim()))
      : [];
    const pointItems = parsedItems.map((item_id: number) => ({
      item_id,
      point_id,
    }));

    await trx("point_items").insert(pointItems);
    await trx.commit();

    return response.json({ success: true });
  }

  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;
    const parsedItems = items
      ? String(items)
          .split(",")
          .map((item) => Number(item.trim()))
      : [];

    parsedItems.map((i) => console.log(`$item: ${i}`));
    const points = await knex("points")
      .join("point_items", "points.id", "=", "point_items.point_id")
      .modify((qb: QueryBuilder) => {
        if (city) qb.where("city", String(city));
        if (uf) qb.where("uf", String(uf));
      })
      .whereIn("point_items.item_id", parsedItems)
      .distinct()
      .select("points.*");

    const serializedPoints = points.map((point) => ({
      ...point,
      image_url: `http://${process.env.HOST}:3333/uploads/${point.image}`,
    }));

    return response.json(serializedPoints);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex("points").where("id", id).first();

    if (!point)
      return response.status(400).json({ message: "Point not found." });
    const serializedPoint = {
      ...point,
      image_url: `http://${process.env.HOST}:3333/uploads/${point.image}`,
    };
    const items = await knex("items")
      .join("point_items", "items.id", "=", "point_items.item_id")
      .where("point_items.point_id", id);

    return response.json({ point: serializedPoint, items });
  }
}

export default PointsController;
