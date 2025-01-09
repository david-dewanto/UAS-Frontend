import { useState } from "react";
import { ListChecks, Copy, Check, ShieldCheck, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const IndividualStocksDocumentation = () => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = async (text: string, snippetId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSnippet(snippetId);
      setTimeout(() => setCopiedSnippet(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const CodeSnippet = ({
    code,
    language,
    snippetId,
  }: {
    code: string;
    language: string;
    snippetId: string;
  }) => (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <button
        className="absolute top-2 right-2 p-2 hover:bg-secondary rounded-md"
        onClick={() => copyToClipboard(code, snippetId)}
      >
        {copiedSnippet === snippetId ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );

  const stockPriceExample = `curl -X GET "https://api.fintrackit.my.id/v1/secure/stock-price/BBCA/2024-01-01_2024-01-31" \\
-H "Authorization: Bearer your_access_token_here"`;

  const stockPriceResponse = `{
  "symbol": "BBCA.JK",
  "prices": [
    {
      "date": "2024-01-02",
      "closing_price": 9275,
      "volume_thousands": 42156
    },
    {
      "date": "2024-01-03",
      "closing_price": 9300,
      "volume_thousands": 38945
    }
  ]
}`;

  const sharpeRatioExample = `curl -X GET "https://api.fintrackit.my.id/v1/secure/sharpe-ratio/BBCA" \\
-H "Authorization: Bearer your_access_token_here"`;

  const sharpeRatioResponse = `{
  "stock_code": "BBCA",
  "sharpe_ratio": 1.245,
  "avg_annual_return": 0.1823,
  "return_volatility": 0.1024,
  "risk_free_rate": 0.055
}`;

  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Individual Stocks Analysis Endpoints
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Complete guide to accessing individual stock data and analysis
        </p>
      </div>

      {/* Service Type Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" />
            Endpoint Type: Secure
          </CardTitle>
          <CardDescription className="text-base">
            Stock analysis services require authentication to maintain data
            integrity and manage access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-base font-medium">
              Base URL: https://api.fintrackit.my.id/v1/secure
            </p>
            <div className="space-y-2">
              <p className="font-semibold">Key Points:</p>
              <ul className="list-disc list-inside space-y-2 text-base">
                <li>
                  All endpoints require a valid Bearer token in the
                  Authorization header
                </li>
                <li>
                  Historical price data is cached for improved performance
                </li>
                <li>Date ranges must be formatted as YYYY-MM-DD_YYYY-MM-DD</li>
              </ul>
            </div>
            <div className="mt-4">
              <p className="text-base">
                <span className="font-semibold">Rate Limits:</span> 150 requests
                / hour
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Services Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <ListChecks className="h-6 w-6" />
            Available Services
          </CardTitle>
          <CardDescription className="text-base">
            List of available stock analysis services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-orange-100 border-orange-200">
            <AlertDescription className="text-foreground">
              Click on any endpoint to jump directly to its detailed
              documentation section
            </AlertDescription>
          </Alert>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4">Service Endpoint</th>
                  <th className="text-left p-4">Method</th>
                  <th className="text-left p-4">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-4">
                    <a
                      href="#stock-price-endpoint"
                      className="text-primary hover:underline font-medium"
                    >
                      /stock-price/{"{stock_code}"}/{"{date_range}"}
                    </a>
                  </td>
                  <td className="p-4">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                      GET
                    </span>
                  </td>
                  <td className="p-4">
                    Get historical stock prices for a specific date range
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-4">
                    <a
                      href="#sharpe-ratio-endpoint"
                      className="text-primary hover:underline font-medium"
                    >
                      /sharpe-ratio/{"{stock_code}"}
                    </a>
                  </td>
                  <td className="p-4">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                      GET
                    </span>
                  </td>
                  <td className="p-4">
                    Calculate Sharpe ratio and related metrics for a stock
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Price Service Documentation */}
      <Card id="stock-price-endpoint">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Stock Price Service
          </CardTitle>
          <CardDescription className="text-base">
            Retrieve historical stock prices for a specified date range
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Endpoint Details */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Service Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">URL:</span>
                <code className="bg-muted px-2 py-1 rounded">
                  https://api.fintrackit.my.id/v1/secure/stock-price/
                  {"{stock_code}"}/{"{date_range}"}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Method:</span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                  GET
                </span>
              </div>
            </div>
          </div>

          {/* Headers */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Header Parameters</h3>
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2">Parameter</th>
                  <th className="text-left p-2">Required</th>
                  <th className="text-left p-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">
                    <code>Authorization</code>
                  </td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">
                    Bearer token obtained from authentication service
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Path Parameters */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Path Parameters</h3>
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2">Parameter</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">
                    <code>stock_code</code>
                  </td>
                  <td className="p-2">string</td>
                  <td className="p-2">IDX stock symbol (e.g., BBCA, TLKM)</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">
                    <code>date_range</code>
                  </td>
                  <td className="p-2">string</td>
                  <td className="p-2">
                    Date range in format YYYY-MM-DD_YYYY-MM-DD
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Response */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Response</h3>
            <p className="mb-2">Success Response (200 OK):</p>
            <CodeSnippet
              code={stockPriceResponse}
              language="json"
              snippetId="stock-price-response"
            />
            <div className="mt-4 space-y-2">
              <p className="font-semibold">Response Fields:</p>
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2">Field</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>symbol</code>
                    </td>
                    <td className="p-2">string</td>
                    <td className="p-2">Stock symbol with .JK suffix</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>prices</code>
                    </td>
                    <td className="p-2">array</td>
                    <td className="p-2">Array of daily price records</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>date</code>
                    </td>
                    <td className="p-2">string</td>
                    <td className="p-2">Trading date (YYYY-MM-DD)</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>closing_price</code>
                    </td>
                    <td className="p-2">number</td>
                    <td className="p-2">Closing price in IDR</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>volume_thousands</code>
                    </td>
                    <td className="p-2">number</td>
                    <td className="p-2">Trading volume in thousands</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Example */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Example Request</h3>
            <CodeSnippet
              code={stockPriceExample}
              language="bash"
              snippetId="stock-price-curl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sharpe Ratio Service Documentation */}
      <Card id="sharpe-ratio-endpoint">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Sharpe Ratio Service
          </CardTitle>
          <CardDescription className="text-base">
            Calculate risk-adjusted return metrics using 3-year historical data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Endpoint Details */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Service Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">URL:</span>
                <code className="bg-muted px-2 py-1 rounded">
                  https://api.fintrackit.my.id/v1/secure/sharpe-ratio/
                  {"{stock_code}"}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Method:</span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                  GET
                </span>
              </div>
            </div>
          </div>

          {/* Headers */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Header Parameters</h3>
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2">Parameter</th>
                  <th className="text-left p-2">Required</th>
                  <th className="text-left p-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">
                    <code>Authorization</code>
                  </td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">
                    Bearer token obtained from authentication service
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Path Parameters */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Path Parameters</h3>
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2">Parameter</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">
                    <code>stock_code</code>
                  </td>
                  <td className="p-2">string</td>
                  <td className="p-2">IDX stock symbol (e.g., BBCA, TLKM)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Response */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Response</h3>
            <p className="mb-2">Success Response (200 OK):</p>
            <CodeSnippet
              code={sharpeRatioResponse}
              language="json"
              snippetId="sharpe-ratio-response"
            />
            <div className="mt-4 space-y-2">
              <p className="font-semibold">Response Fields:</p>
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2">Field</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>stock_code</code>
                    </td>
                    <td className="p-2">string</td>
                    <td className="p-2">Stock symbol</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>sharpe_ratio</code>
                    </td>
                    <td className="p-2">number</td>
                    <td className="p-2">
                      Calculated Sharpe ratio using 3-year data
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>avg_annual_return</code>
                    </td>
                    <td className="p-2">number</td>
                    <td className="p-2">Average annualized return</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>return_volatility</code>
                    </td>
                    <td className="p-2">number</td>
                    <td className="p-2">Annualized return volatility</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>risk_free_rate</code>
                    </td>
                    <td className="p-2">number</td>
                    <td className="p-2">
                      Risk-free rate used in calculation (5.5%)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Example */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Example Request</h3>
            <CodeSnippet
              code={sharpeRatioExample}
              language="bash"
              snippetId="sharpe-ratio-curl"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndividualStocksDocumentation;
