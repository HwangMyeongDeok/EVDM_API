import { AppDataSource } from "../../config/data-source";
import {
  DealerVehicleRequest,
  DealerVehicleRequestItem,
  DealerVehicleRequestStatus,
} from "./dealer-request.model";

export class DealerRequestRepository {
  private reqRepo = AppDataSource.getRepository(DealerVehicleRequest);
  private itemRepo = AppDataSource.getRepository(DealerVehicleRequestItem);

  async createWithItems(
    dealerId: number,
    items: { variant_id: number; requested_quantity: number }[]
  ): Promise<DealerVehicleRequest> {
    return AppDataSource.transaction(async (trx) => {
      const reqRepo = trx.getRepository(DealerVehicleRequest);
      const itemRepo = trx.getRepository(DealerVehicleRequestItem);

      const header = reqRepo.create({
        dealer_id: dealerId,
        status: DealerVehicleRequestStatus.PENDING,
      });
      const saved = await reqRepo.save(header);

      const itemEntities = items.map((it) =>
        itemRepo.create({
          request_id: saved.request_id,
          variant_id: it.variant_id,
          requested_quantity: it.requested_quantity,
        })
      );
      await itemRepo.save(itemEntities);

      return reqRepo.findOne({
        where: { request_id: saved.request_id },
        relations: ["dealer", "items", "items.variant", "items.variant.vehicle"],
      }) as Promise<DealerVehicleRequest>;
    });
  }

  async findAllByDealer(dealerId: number): Promise<DealerVehicleRequest[]> {
    return this.reqRepo.find({
      where: { dealer_id: dealerId },
      relations: ["items", "items.variant", "items.variant.vehicle"],
      order: { created_at: "DESC" },
    });
  }

  async findById(id: number): Promise<DealerVehicleRequest | null> {
    return this.reqRepo.findOne({
      where: { request_id: id },
      relations: ["dealer", "items", "items.variant", "items.variant.vehicle"],
    });
  }

  async findPending(): Promise<DealerVehicleRequest[]> {
    return this.reqRepo.find({
      where: { status: DealerVehicleRequestStatus.PENDING },
      relations: ["dealer", "items", "items.variant", "items.variant.vehicle"],
    });
  }

  async save(request: DealerVehicleRequest): Promise<DealerVehicleRequest> {
    return this.reqRepo.save(request);
  }

  async delete(id: number): Promise<void> {
    await this.reqRepo.delete(id);
  }
}

export default new DealerRequestRepository();
