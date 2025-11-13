import { AppError } from "../../common/middlewares/AppError";
import DashboardRepository from "./dashboard.repository";

type Range = { from?: string; to?: string; limit?: number };

export class DashboardService {
  async managerDashboard(params: Range & { dealerId: number }) {
    const { dealerId, from, to, limit } = params;
    try {
      const [
        kpis,
        monthlyPerformance,
        salesByStaff,
        lowStock,
        highValueContracts,
      ] = await Promise.all([
        DashboardRepository.getManagerKpis(dealerId, from, to),
        DashboardRepository.getManagerMonthlyPerformance(dealerId, from, to),
        DashboardRepository.getSalesByStaff(dealerId, from, to),
        DashboardRepository.getDealerLowStock(dealerId, 5), // ngưỡng 5
        DashboardRepository.getHighValueContracts(dealerId, from, to, limit ?? 5, 50000), // ngưỡng 50k
      ]);

      return {
        kpis,
        monthlyPerformance,
        salesByStaff,
        lowStock,
        highValueContracts,
      };
    } catch (e) {
      throw new AppError("Không thể tải dữ liệu Dashboard (Manager). Vui lòng thử lại.", 500);
    }
  }

  async staffDashboard(params: Range & { dealerId: number; userId: number }) {
    const { dealerId, userId, from, to, limit } = params;
    try {
      const [
        myKpis,
        myRecentQuotations,
        myRecentContracts,
        myPendingDeliveries,
        myInventoryView,
      ] = await Promise.all([
        DashboardRepository.getStaffKpis(dealerId, userId, from, to),
        DashboardRepository.getMyQuotations(userId, from, to, limit ?? 5),
        DashboardRepository.getMyContracts(userId, from, to, limit ?? 5),
        DashboardRepository.getMyPendingDeliveries(userId, from, to, limit ?? 5),
        DashboardRepository.getDealerInventory(dealerId, 10),
      ]);

      return {
        kpis: myKpis,
        recentQuotations: myRecentQuotations,
        recentContracts: myRecentContracts,
        pendingDeliveries: myPendingDeliveries,
        inventorySample: myInventoryView,
      };
    } catch (e) {
      throw new AppError("Không thể tải dữ liệu Dashboard (Staff). Vui lòng thử lại.", 500);
    }
  }

  async evmDashboard(params: Range) {
    const { from, to, limit } = params;
    try {
      const [
        evmKpis,
        pendingDealerRequests,
        inTransitAllocations,
        manufacturerLowStock,
        creditUtilization,
      ] = await Promise.all([
        DashboardRepository.getEvmKpis(from, to),
        DashboardRepository.getPendingDealerRequests(limit ?? 5),
        DashboardRepository.getInTransitAllocations(limit ?? 5),
        DashboardRepository.getManufacturerLowStock(10), // top 10 hãng sắp hết hàng
        DashboardRepository.getCreditUtilizationTop(limit ?? 5),
      ]);

      return {
        kpis: evmKpis,
        pendingDealerRequests,
        inTransitAllocations,
        manufacturerLowStock,
        creditUtilization,
      };
    } catch (e) {
      throw new AppError("Không thể tải dữ liệu Dashboard (EVM). Vui lòng thử lại.", 500);
    }
  }
}

export default new DashboardService();
