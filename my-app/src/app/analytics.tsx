"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const Analytics = () => {
  interface AnalysisResults {
    highestSalesVolumeDay: string;
    highestSalesVolume: number;
    highestSalesValueDay: string;
    highestSalesValue: number;
    mostSoldProductId: string;
    mostSoldProductVolume: number;
    highestSalesStaffByMonth: { [month: string]: string };
    highestHour: number;
    highestHourAvgVolume: number;
  }
  
  const [results, setResults] = useState<AnalysisResults | null>(null)

  const runAnalysis = async () => {
    // This function will be called when the button is clicked
    // It will send a request to our server to run the analysis
    try {
      const response = await fetch("/api/analyze", { method: "POST" })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error running analysis:", error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Monieshop Analytics</h1>
      <Button onClick={runAnalysis}>Run Analysis</Button>
      {results && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Highest Sales Volume in a Day</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Date: {results.highestSalesVolumeDay}</p>
              <p>Volume: {results.highestSalesVolume}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Highest Sales Value in a Day</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Date: {results.highestSalesValueDay}</p>
              <p>Value: ${results.highestSalesValue.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Most Sold Product ID by Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Product ID: {results.mostSoldProductId}</p>
              <p>Volume: {results.mostSoldProductVolume}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Highest Sales Staff ID for Each Month</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {Object.entries(results.highestSalesStaffByMonth).map(([month, staffId]) => (
                  <li key={month}>
                    {month}: Staff ID {staffId}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Highest Hour of the Day by Average Transaction Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Hour: {results.highestHour}:00</p>
              <p>Average Volume: {results.highestHourAvgVolume.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Analytics

