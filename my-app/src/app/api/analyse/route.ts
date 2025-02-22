import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import zlib from "zlib"


//what i did here was an async function that "post" all data from the transactions and then it will return the results of the analysis
export async function POST() {
  try {
    const results = await analyzeTransactions()
    return NextResponse.json(results)
  } catch (error) {
    console.error("Error in analysis:", error)
    return NextResponse.json({ error: "An error occurred during analysis" }, { status: 500 })
  }
}

async function analyzeTransactions() {
  const dataDir = path.join(process.cwd(), "data")
  const files = fs.readdirSync(dataDir)

  let highestSalesVolume = 0
  let highestSalesVolumeDay = ""
  let highestSalesValue = 0
  let highestSalesValueDay = ""
  const productSales: { [key: string]: number } = {}
  const staffSalesByMonth: { [key: string]: { [key: string]: number } } = {}
  const hourlyTransactions = Array(24).fill(0)
  const hourlyTransactionCounts = Array(24).fill(0)

  for (const file of files) {
    if (file.endsWith(".txt")) {
      const filePath = path.join(dataDir, file)
      const content = fs.readFileSync(filePath, "utf8")
      const lines = content.split("\n")

      let dailySalesVolume = 0
      let dailySalesValue = 0

      for (const line of lines) {
        if (line.trim() === "") continue

        const [staffId, timestamp, products, saleAmount] = line.split(",")
        const date = timestamp.split("T")[0]
        const hour = Number.parseInt(timestamp.split("T")[1].split(":")[0])
        const saleValue = Number.parseFloat(saleAmount)

        // Update daily sales
        dailySalesVolume += 1
        dailySalesValue += saleValue

        // Update product sales
        const productList = products.slice(1, -1).split("|")
        for (const product of productList) {
          const [productId, quantity] = product.split(":")
          productSales[productId] = (productSales[productId] || 0) + Number.parseInt(quantity)
        }

        // Update staff sales by month
        const month = date.slice(0, 7)
        if (!staffSalesByMonth[month]) {
          staffSalesByMonth[month] = {}
        }
        staffSalesByMonth[month][staffId] = (staffSalesByMonth[month][staffId] || 0) + saleValue

        // Update hourly transactions
        hourlyTransactions[hour] += 1
        hourlyTransactionCounts[hour] += 1
      }

      // Update highest sales volume and value
      if (dailySalesVolume > highestSalesVolume) {
        highestSalesVolume = dailySalesVolume
        highestSalesVolumeDay = file.split(".")[0]
      }
      if (dailySalesValue > highestSalesValue) {
        highestSalesValue = dailySalesValue
        highestSalesValueDay = file.split(".")[0]
      }
    }
  }

  // Calculate most sold product
  const mostSoldProductId = Object.keys(productSales).reduce((a, b) => (productSales[a] > productSales[b] ? a : b))

  // Calculate highest sales staff for each month
  const highestSalesStaffByMonth: { [key: string]: string } = {}
  for (const month in staffSalesByMonth) {
    highestSalesStaffByMonth[month] = Object.keys(staffSalesByMonth[month]).reduce((a, b) =>
      staffSalesByMonth[month][a] > staffSalesByMonth[month][b] ? a : b,
    )
  }

  // Calculate highest hour by average transaction volume
  const avgHourlyTransactions = hourlyTransactions.map((total, index) => total / hourlyTransactionCounts[index])
  const highestHour = avgHourlyTransactions.indexOf(Math.max(...avgHourlyTransactions))

  return {
    highestSalesVolumeDay,
    highestSalesVolume,
    highestSalesValueDay,
    highestSalesValue,
    mostSoldProductId,
    mostSoldProductVolume: productSales[mostSoldProductId],
    highestSalesStaffByMonth,
    highestHour,
    highestHourAvgVolume: avgHourlyTransactions[highestHour],
  }
}


