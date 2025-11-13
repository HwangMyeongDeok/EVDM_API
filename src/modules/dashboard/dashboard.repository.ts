import { AppDataSource } from "../../config/data-source";

function rangeClause(from?: string, to?: string) {
  // created_at hoặc ngày giao dịch… tuỳ bảng
  const fromSql = from ? `'${from}'` : "DATEADD(MONTH, -6, CAST(GETDATE() AS date))";
  const toSql = to ? `'${to}'` : "CAST(GETDATE() AS date)";
  return { fromSql, toSql };
}

export class DashboardRepository {
  // === MANAGER ===
  async getManagerKpis(dealerId: number, from?: string, to?: string) {
    const { fromSql, toSql } = rangeClause(from, to);
    const mgr = AppDataSource.manager;

    // Doanh thu: sum(contracts.final_amount) trong khoảng thời gian
    const revenue = await mgr.query(`
      SELECT ISNULL(SUM(c.final_amount), 0) AS revenue
      FROM contracts c
      WHERE c.dealer_id = @0
        AND c.contract_date BETWEEN ${fromSql} AND ${toSql}
        AND c.status IN ('SIGNED','IN_PROGRESS','COMPLETED')
    `, [dealerId]);

    // Lợi nhuận (ước tính): sum(line_total - dealer_price * quantity)
    const profit = await mgr.query(`
      SELECT ISNULL(SUM(ci.line_total - (vv.dealer_price * ci.quantity)), 0) AS profit
      FROM contract_items ci
      JOIN contracts c ON c.contract_id = ci.contract_id
      JOIN vehicle_variants vv ON vv.variant_id = ci.variant_id
      WHERE c.dealer_id = @0
        AND c.contract_date BETWEEN ${fromSql} AND ${toSql}
        AND c.status IN ('SIGNED','IN_PROGRESS','COMPLETED')
    `, [dealerId]);

    const units = await mgr.query(`
      SELECT ISNULL(SUM(ci.quantity), 0) AS units_sold
      FROM contract_items ci
      JOIN contracts c ON c.contract_id = ci.contract_id
      WHERE c.dealer_id = @0
        AND c.contract_date BETWEEN ${fromSql} AND ${toSql}
        AND c.status IN ('COMPLETED')
    `, [dealerId]);

    const staff = await mgr.query(`
      SELECT COUNT(*) AS staff_count
      FROM users u
      WHERE u.dealer_id = @0
        AND u.role IN ('DEALER_STAFF','DEALER_MANAGER')
    `, [dealerId]);

    return {
      totalRevenue: Number(revenue[0]?.revenue ?? 0),
      totalProfit: Number(profit[0]?.profit ?? 0),
      totalUnitsSold: Number(units[0]?.units_sold ?? 0),
      totalStaff: Number(staff[0]?.staff_count ?? 0),
    };
  }

  async getManagerMonthlyPerformance(dealerId: number, from?: string, to?: string) {
    const { fromSql, toSql } = rangeClause(from, to);
    const mgr = AppDataSource.manager;
    // Gom theo tháng: revenue & profit
    return mgr.query(`
      WITH R AS (
        SELECT
          FORMAT(c.contract_date, 'yyyy-MM') AS ym,
          SUM(c.final_amount) AS revenue
        FROM contracts c
        WHERE c.dealer_id = @0
          AND c.contract_date BETWEEN ${fromSql} AND ${toSql}
          AND c.status IN ('SIGNED','IN_PROGRESS','COMPLETED')
        GROUP BY FORMAT(c.contract_date, 'yyyy-MM')
      ),
      P AS (
        SELECT
          FORMAT(c.contract_date, 'yyyy-MM') AS ym,
          SUM(ci.line_total - (vv.dealer_price * ci.quantity)) AS profit
        FROM contract_items ci
        JOIN contracts c ON c.contract_id = ci.contract_id
        JOIN vehicle_variants vv ON vv.variant_id = ci.variant_id
        WHERE c.dealer_id = @0
          AND c.contract_date BETWEEN ${fromSql} AND ${toSql}
          AND c.status IN ('SIGNED','IN_PROGRESS','COMPLETED')
        GROUP BY FORMAT(c.contract_date, 'yyyy-MM')
      )
      SELECT R.ym AS month, ISNULL(R.revenue,0) AS revenue, ISNULL(P.profit,0) AS profit
      FROM R
      FULL OUTER JOIN P ON P.ym = R.ym
      ORDER BY month ASC
    `, [dealerId]);
  }

  async getSalesByStaff(dealerId: number, from?: string, to?: string) {
    const { fromSql, toSql } = rangeClause(from, to);
    const mgr = AppDataSource.manager;
    return mgr.query(`
      SELECT u.full_name AS name,
             COUNT(DISTINCT c.contract_id) AS sales,
             ISNULL(SUM(c.final_amount),0) AS revenue
      FROM contracts c
      JOIN users u ON u.user_id = c.user_id
      WHERE c.dealer_id = @0
        AND c.contract_date BETWEEN ${fromSql} AND ${toSql}
        AND c.status IN ('SIGNED','IN_PROGRESS','COMPLETED')
      GROUP BY u.full_name
      ORDER BY revenue DESC
    `, [dealerId]);
  }

  async getDealerLowStock(dealerId: number, threshold: number) {
    const mgr = AppDataSource.manager;
    return mgr.query(`
      SELECT TOP 10 vv.variant_id, CONCAT(v.model_name, ' ', vv.version, ' ', vv.color) AS model,
             i.quantity AS inStock
      FROM inventory i
      JOIN vehicle_variants vv ON vv.variant_id = i.variant_id
      JOIN vehicles v ON v.vehicle_id = vv.vehicle_id
      WHERE i.dealer_id = @0
        AND i.quantity <= @1
      ORDER BY i.quantity ASC
    `, [dealerId, threshold]);
  }

  async getHighValueContracts(dealerId: number, from?: string, to?: string, limit = 5, minAmount = 50000) {
    const { fromSql, toSql } = rangeClause(from, to);
    const mgr = AppDataSource.manager;
    return mgr.query(`
      SELECT TOP (@2)
        c.contract_id AS id,
        cu.full_name AS customerName,
        ISNULL(c.final_amount,0) AS totalAmount,
        u.full_name AS salespersonName,
        c.status AS status
      FROM contracts c
      JOIN customers cu ON cu.customer_id = c.customer_id
      JOIN users u ON u.user_id = c.user_id
      WHERE c.dealer_id = @0
        AND c.contract_date BETWEEN ${fromSql} AND ${toSql}
        AND ISNULL(c.final_amount,0) >= @3
      ORDER BY c.final_amount DESC, c.contract_date DESC
    `, [dealerId, fromSql, limit, minAmount]);
  }

  // === STAFF ===
  async getStaffKpis(dealerId: number, userId: number, from?: string, to?: string) {
    const { fromSql, toSql } = rangeClause(from, to);
    const mgr = AppDataSource.manager;

    const qts = await mgr.query(`
      SELECT COUNT(*) AS quotations
      FROM quotations q
      WHERE q.user_id = @0
        AND q.dealer_id = @1
        AND q.created_at BETWEEN ${fromSql} AND ${toSql}
    `, [userId, dealerId]);

    const ctr = await mgr.query(`
      SELECT COUNT(*) AS contracts, ISNULL(SUM(final_amount),0) AS revenue
      FROM contracts c
      WHERE c.user_id = @0
        AND c.dealer_id = @1
        AND c.contract_date BETWEEN ${fromSql} AND ${toSql}
        AND c.status IN ('SIGNED','IN_PROGRESS','COMPLETED')
    `, [userId, dealerId]);

    const deliveries = await mgr.query(`
      SELECT COUNT(*) AS pending_deliveries
      FROM dealer_vehicle_allocations a
      WHERE a.dealer_id = @0
        AND a.status IN ('PENDING','IN_TRANSIT')
    `, [dealerId]);

    return {
      quotations: Number(qts[0]?.quotations ?? 0),
      contracts: Number(ctr[0]?.contracts ?? 0),
      revenue: Number(ctr[0]?.revenue ?? 0),
      pendingDeliveries: Number(deliveries[0]?.pending_deliveries ?? 0),
    };
  }

  async getMyQuotations(userId: number, from?: string, to?: string, limit = 5) {
    const { fromSql, toSql } = rangeClause(from, to);
    const mgr = AppDataSource.manager;
    return mgr.query(`
      SELECT TOP (@1)
        q.quotation_id AS id,
        q.quotation_number,
        q.status,
        q.total_amount,
        CONVERT(varchar(10), q.created_at, 120) AS createdAt
      FROM quotations q
      WHERE q.user_id = @0
        AND q.created_at BETWEEN ${fromSql} AND ${toSql}
      ORDER BY q.created_at DESC
    `, [userId, limit]);
  }

  async getMyContracts(userId: number, from?: string, to?: string, limit = 5) {
    const { fromSql, toSql } = rangeClause(from, to);
    const mgr = AppDataSource.manager;
    return mgr.query(`
      SELECT TOP (@1)
        c.contract_id AS id,
        c.contract_code,
        c.status,
        c.final_amount,
        CONVERT(varchar(10), c.contract_date, 120) AS contractDate
      FROM contracts c
      WHERE c.user_id = @0
        AND c.contract_date BETWEEN ${fromSql} AND ${toSql}
      ORDER BY c.contract_date DESC
    `, [userId, limit]);
  }

  async getMyPendingDeliveries(userId: number, from?: string, to?: string, limit = 5) {
    // Hiển thị các allocation đang PENDING/IN_TRANSIT (giao xe về đại lý)
    const mgr = AppDataSource.manager;
    return mgr.query(`
      SELECT TOP (@1)
        a.allocation_id AS id,
        a.delivery_batch,
        a.status,
        CONVERT(varchar(10), a.delivery_date, 120) AS deliveryDate
      FROM dealer_vehicle_allocations a
      JOIN contracts c ON c.dealer_id = a.dealer_id
      WHERE c.user_id = @0
        AND a.status IN ('PENDING','IN_TRANSIT')
      ORDER BY a.delivery_date DESC
    `, [userId, limit]);
  }

  async getDealerInventory(dealerId: number, limit = 10) {
    const mgr = AppDataSource.manager;
    return mgr.query(`
      SELECT TOP (@1)
        vv.variant_id,
        CONCAT(v.model_name, ' ', vv.version, ' ', vv.color) AS model,
        i.quantity
      FROM inventory i
      JOIN vehicle_variants vv ON vv.variant_id = i.variant_id
      JOIN vehicles v ON v.vehicle_id = vv.vehicle_id
      WHERE i.dealer_id = @0
      ORDER BY i.quantity ASC
    `, [dealerId, limit]);
  }

  // === EVM ===
  async getEvmKpis(from?: string, to?: string) {
    const { fromSql, toSql } = rangeClause(from, to);
    const mgr = AppDataSource.manager;

    const pendingReq = await mgr.query(`
      SELECT COUNT(*) AS pending_requests
      FROM dealer_vehicle_requests r
      WHERE r.status = 'PENDING'
        AND r.created_at BETWEEN ${fromSql} AND ${toSql}
    `);

    const inTransit = await mgr.query(`
      SELECT COUNT(*) AS allocations_in_transit
      FROM dealer_vehicle_allocations a
      WHERE a.status = 'IN_TRANSIT'
        AND a.created_at BETWEEN ${fromSql} AND ${toSql}
    `);

    const delivered = await mgr.query(`
      SELECT COUNT(*) AS delivered_this_range
      FROM dealer_vehicle_allocations a
      WHERE a.status = 'DELIVERED'
        AND a.delivery_date BETWEEN ${fromSql} AND ${toSql}
    `);

    const manufacturerStock = await mgr.query(`
      SELECT ISNULL(SUM(i.quantity),0) AS stock
      FROM inventory i
      WHERE i.dealer_id IS NULL
    `);

    return {
      pendingRequests: Number(pendingReq[0]?.pending_requests ?? 0),
      allocationsInTransit: Number(inTransit[0]?.allocations_in_transit ?? 0),
      deliveredThisRange: Number(delivered[0]?.delivered_this_range ?? 0),
      manufacturerStock: Number(manufacturerStock[0]?.stock ?? 0),
    };
  }

  async getPendingDealerRequests(limit = 5) {
    const mgr = AppDataSource.manager;
    return mgr.query(`
      SELECT TOP (@0)
        r.request_id AS id,
        d.dealer_name,
        r.variant_id,
        r.requested_quantity,
        r.status,
        CONVERT(varchar(10), r.created_at, 120) AS createdAt
      FROM dealer_vehicle_requests r
      JOIN dealers d ON d.dealer_id = r.dealer_id
      WHERE r.status = 'PENDING'
      ORDER BY r.created_at DESC
    `, [limit]);
  }

  async getInTransitAllocations(limit = 5) {
    const mgr = AppDataSource.manager;
    return mgr.query(`
      SELECT TOP (@0)
        a.allocation_id AS id,
        d.dealer_name,
        a.variant_id,
        a.allocated_quantity,
        a.delivery_batch,
        a.status,
        CONVERT(varchar(10), a.delivery_date, 120) AS deliveryDate
      FROM dealer_vehicle_allocations a
      JOIN dealers d ON d.dealer_id = a.dealer_id
      WHERE a.status = 'IN_TRANSIT'
      ORDER BY a.delivery_date DESC
    `, [limit]);
  }

  async getManufacturerLowStock(limit = 10) {
    const mgr = AppDataSource.manager;
    return mgr.query(`
      SELECT TOP (@0)
        vv.variant_id,
        CONCAT(v.model_name, ' ', vv.version, ' ', vv.color) AS model,
        i.quantity
      FROM inventory i
      JOIN vehicle_variants vv ON vv.variant_id = i.variant_id
      JOIN vehicles v ON v.vehicle_id = vv.vehicle_id
      WHERE i.dealer_id IS NULL
      ORDER BY i.quantity ASC
    `, [limit]);
  }

  async getCreditUtilizationTop(limit = 5) {
    // % sử dụng: tổng nợ hiện tại / hạn mức (hợp đồng đại lý ACTIVE gần nhất)
    const mgr = AppDataSource.manager;
    return mgr.query(`
      SELECT TOP (@0)
        d.dealer_id,
        d.dealer_name,
        ISNULL(SUM(dd.amount),0) AS total_debt,
        ISNULL(MAX(dc.credit_limit),0) AS credit_limit,
        CASE WHEN ISNULL(MAX(dc.credit_limit),0) = 0 THEN 0
             ELSE CAST(ISNULL(SUM(dd.amount),0) AS float) / CAST(MAX(dc.credit_limit) AS float) * 100 END AS utilization_percent
      FROM dealers d
      LEFT JOIN dealer_debts dd ON dd.dealer_id = d.dealer_id AND dd.status IN ('PENDING','OVERDUE')
      LEFT JOIN dealer_contracts dc ON dc.dealer_id = d.dealer_id AND dc.status = 'ACTIVE'
      GROUP BY d.dealer_id, d.dealer_name
      ORDER BY utilization_percent DESC
    `, [limit]);
  }
}

export default new DashboardRepository();
