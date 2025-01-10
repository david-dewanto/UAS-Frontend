import { useState, useEffect } from "react";
import { ListChecks, Copy, Check, ShieldCheck, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const PortfolioDocumentation = () => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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

  const optimizePortfolioExample = `curl -X POST "https://api.fintrackit.my.id/v1/secure/optimize-portfolio" \\
-H "Authorization: Bearer your_access_token_here" \\
-H "Content-Type: application/json" \\
-d '{
    "stock_codes": ["BBCA", "TLKM", "ASII"],
    "target_return": 0.15
    // OR "target_volatility": 0.20
}'`;

  const optimizePortfolioResponse = `{
  "allocations": [
    {
      "stock_code": "BBCA",
      "weight": 0.4235
    },
    {
      "stock_code": "TLKM",
      "weight": 0.3142
    },
    {
      "stock_code": "ASII",
      "weight": 0.2623
    }
  ],
  "expected_return": 0.1500,
  "expected_volatility": 0.1824,
  "sharpe_ratio": 0.5208,
  "risk_free_rate": 0.0550,
  "optimization_criteria": "return",
  "target_value": 0.1500
}`;

  const portfolioRangesExample = `curl -X POST "https://api.fintrackit.my.id/v1/secure/portfolio-ranges" \\
-H "Authorization: Bearer your_access_token_here" \\
-H "Content-Type: application/json" \\
-d '{
    "stock_codes": ["BBCA", "TLKM", "ASII"]
}'`;

  const portfolioRangesResponse = `{
  "return_range": {
    "min": 0.0823,
    "max": 0.2145
  },
  "volatility_range": {
    "min": 0.1245,
    "max": 0.2856
  }
}`;

  const calculateReturnsExample = `curl -X POST "https://api.fintrackit.my.id/v1/secure/calculate-portfolio-returns" \\
-H "Authorization: Bearer your_access_token_here" \\
-H "Content-Type: application/json" \\
-d '{
    "transactions": [
        {
            "stock_code": "BBCA",
            "transaction_date": "2024-01-01",
            "transaction_type": "buy",
            "quantity": 100,
            "price_per_share": 9000,
            "total_value": 900000
        },
        {
            "stock_code": "BBCA",
            "transaction_date": "2024-01-15",
            "transaction_type": "sell",
            "quantity": 50,
            "price_per_share": 9500,
            "total_value": 475000
        }
    ]
}'`;

  const calculateReturnsResponse = `{
  "portfolio_twr": 0.0524,
  "portfolio_mwr": 0.0489,
  "calculation_date": "2024-01-09T08:30:00Z",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-01-15T00:00:00Z",
  "stock_breakdown": {} // Deprecated (discontinued)
}`;

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Title Section Skeleton */}
        <div className="border-b pb-6">
          <Skeleton className="h-12 w-96 mb-4" />
          <Skeleton className="h-6 w-[600px]" />
        </div>

        {/* Service Type Overview Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-72 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-6 w-96" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-2 pl-4">
                  <Skeleton className="h-4 w-full max-w-2xl" />
                  <Skeleton className="h-4 w-full max-w-xl" />
                  <Skeleton className="h-4 w-full max-w-2xl" />
                </div>
              </div>
              <Skeleton className="h-5 w-48" />
            </div>
          </CardContent>
        </Card>

        {/* Services Directory Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Optimize Portfolio Service Documentation Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-72 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Service Details Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full max-w-xl" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>

              {/* Headers Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-32 w-full" />
              </div>

              {/* Request Body Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-40 w-full" />
              </div>

              {/* Response Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-24 w-full" />
                <div className="space-y-2 mt-4">
                  <Skeleton className="h-6 w-56" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>

              {/* Example Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Ranges and Calculate Returns Skeletons */}
        {["Portfolio Ranges", "Calculate Returns"].map((title) => (
          <Card key={title}>
            <CardHeader>
              <Skeleton className="h-8 w-72 mb-2" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Service Details Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full max-w-xl" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>

                {/* Headers Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-56" />
                  <Skeleton className="h-32 w-full" />
                </div>

                {/* Request Body Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-40 w-full" />
                </div>

                {/* Response Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-24 w-full" />
                </div>

                {/* Example Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-40 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Portfolio Analysis Endpoints
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Complete guide to portfolio optimization and analysis endpoints
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
            Portfolio analysis services require authentication for data security
            and access management
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
                <li>Maximum of 5 stocks per portfolio for optimization</li>
                <li>Uses 3-year historical data for calculations</li>
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
            List of available portfolio analysis services
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
                      href="#optimize-portfolio-endpoint"
                      className="text-primary hover:underline font-medium"
                    >
                      /optimize-portfolio
                    </a>
                  </td>
                  <td className="p-4">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                      POST
                    </span>
                  </td>
                  <td className="p-4">
                    Optimize portfolio weights based on Modern Portfolio Theory
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-4">
                    <a
                      href="#portfolio-ranges-endpoint"
                      className="text-primary hover:underline font-medium"
                    >
                      /portfolio-ranges
                    </a>
                  </td>
                  <td className="p-4">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                      POST
                    </span>
                  </td>
                  <td className="p-4">
                    Calculate feasible ranges for return and volatility for Modern Portfolio Theory
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-4">
                    <a
                      href="#calculate-returns-endpoint"
                      className="text-primary hover:underline font-medium"
                    >
                      /calculate-portfolio-returns
                    </a>
                  </td>
                  <td className="p-4">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                      POST
                    </span>
                  </td>
                  <td className="p-4">
                    Calculate portfolio returns using TWR and MWR methods
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Optimize Portfolio Service Documentation */}
      <Card id="optimize-portfolio-endpoint">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Portfolio Optimization Service
          </CardTitle>
          <CardDescription className="text-base">
            Optimize portfolio weights using Modern Portfolio Theory
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
                  https://api.fintrackit.my.id/v1/secure/optimize-portfolio
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Method:</span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                  POST
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
                <tr className="border-t">
                  <td className="p-2">
                    <code>Content-Type</code>
                  </td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Must be application/json</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Request Body */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Request Body</h3>
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2">Field</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Required</th>
                  <th className="text-left p-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">
                    <code>stock_codes</code>
                  </td>
                  <td className="p-2">array</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Array of stock symbols (2-5 stocks)</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">
                    <code>target_return</code>
                  </td>
                  <td className="p-2">number</td>
                  <td className="p-2">Conditional</td>
                  <td className="p-2">
                    Target minimum annual return (e.g., 0.15 for 15%)
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">
                    <code>target_volatility</code>
                  </td>
                  <td className="p-2">number</td>
                  <td className="p-2">Conditional</td>
                  <td className="p-2">Target maximum annual volatility</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-sm text-muted-foreground">
              Note: Either target_return OR target_volatility must be provided,
              but not both
            </p>
          </div>

          {/* Response */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Response</h3>
            <p className="mb-2">Success Response (200 OK):</p>
            <CodeSnippet
              code={optimizePortfolioResponse}
              language="json"
              snippetId="optimize-portfolio-response"
            />
            <div className="mt-4 space-y-2">
              <p className="font-semibold">Response Fields:</p>
              <table className="w-full">
                <thead className="bg-muted"></thead>
                <tr>
                  <th className="text-left p-2">Field</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Description</th>
                </tr>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>allocations</code>
                    </td>
                    <td className="p-2">array</td>
                    <td className="p-2">Array of optimal stock allocations</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>expected_return</code>
                    </td>
                    <td className="p-2">number</td>
                    <td className="p-2">Expected annual portfolio return</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>expected_volatility</code>
                    </td>
                    <td className="p-2">number</td>
                    <td className="p-2">
                      Expected annual portfolio volatility
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>sharpe_ratio</code>
                    </td>
                    <td className="p-2">number</td>
                    <td className="p-2">Portfolio Sharpe ratio</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>risk_free_rate</code>
                    </td>
                    <td className="p-2">number</td>
                    <td className="p-2">Risk-free rate used (5.5%)</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>optimization_criteria</code>
                    </td>
                    <td className="p-2">string</td>
                    <td className="p-2">"return" or "volatility"</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>target_value</code>
                    </td>
                    <td className="p-2">number</td>
                    <td className="p-2">Target value used for optimization</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Example */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Example Request</h3>
            <CodeSnippet
              code={optimizePortfolioExample}
              language="bash"
              snippetId="optimize-portfolio-curl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Ranges Service Documentation */}
      <Card id="portfolio-ranges-endpoint">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Portfolio Ranges Service
          </CardTitle>
          <CardDescription className="text-base">
            Calculate feasible ranges for portfolio return and volatility
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
                  https://api.fintrackit.my.id/v1/secure/portfolio-ranges
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Method:</span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                  POST
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
                <tr className="border-t">
                  <td className="p-2">
                    <code>Content-Type</code>
                  </td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Must be application/json</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Request Body */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Request Body</h3>
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2">Field</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Required</th>
                  <th className="text-left p-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">
                    <code>stock_codes</code>
                  </td>
                  <td className="p-2">array</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Array of stock symbols (2-5 stocks)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Response */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Response</h3>
            <p className="mb-2">Success Response (200 OK):</p>
            <CodeSnippet
              code={portfolioRangesResponse}
              language="json"
              snippetId="portfolio-ranges-response"
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
                      <code>return_range</code>
                    </td>
                    <td className="p-2">object</td>
                    <td className="p-2">Min/max achievable returns</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>volatility_range</code>
                    </td>
                    <td className="p-2">object</td>
                    <td className="p-2">Min/max volatility range</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Example */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Example Request</h3>
            <CodeSnippet
              code={portfolioRangesExample}
              language="bash"
              snippetId="portfolio-ranges-curl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Calculate Returns Service Documentation */}
      <Card id="calculate-returns-endpoint">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Portfolio Returns Service
          </CardTitle>
          <CardDescription className="text-base">
            Calculate Time-Weighted Return (TWR) and Money-Weighted Return (MWR)
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
                  https://api.fintrackit.my.id/v1/secure/calculate-portfolio-returns
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Method:</span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                  POST
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
                <tr className="border-t">
                  <td className="p-2">
                    <code>Content-Type</code>
                  </td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Must be application/json</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Request Body */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Request Body</h3>
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2">Field</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Required</th>
                  <th className="text-left p-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">
                    <code>transactions</code>
                  </td>
                  <td className="p-2">array</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Array of transaction objects</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">
                    <code>transaction_date</code>
                  </td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Date of transaction (YYYY-MM-DD)</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">
                    <code>transaction_type</code>
                  </td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">"buy" or "sell"</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">
                    <code>quantity</code>
                  </td>
                  <td className="p-2">number</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Number of shares</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">
                    <code>price_per_share</code>
                  </td>
                  <td className="p-2">number</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Price per share in IDR</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">
                    <code>total_value</code>
                  </td>
                  <td className="p-2">number</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Total transaction value in IDR</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Response */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Response</h3>
            <p className="mb-2">Success Response (200 OK):</p>
            <CodeSnippet
              code={calculateReturnsResponse}
              language="json"
              snippetId="calculate-returns-response"
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
                      <code>portfolio_twr</code>
                    </td>
                    <td className="p-2">number</td>
                    <td className="p-2">Time-weighted return</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>portfolio_mwr</code>
                    </td>
                    <td className="p-2">number</td>
                    <td className="p-2">Money-weighted return</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>calculation_date</code>
                    </td>
                    <td className="p-2">string</td>
                    <td className="p-2">Timestamp of calculation (ISO 8601)</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>start_date</code>
                    </td>
                    <td className="p-2">string</td>
                    <td className="p-2">First transaction date (ISO 8601)</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>end_date</code>
                    </td>
                    <td className="p-2">string</td>
                    <td className="p-2">Latest market data date (ISO 8601)</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>stock_breakdown</code>
                    </td>
                    <td className="p-2">object</td>
                    <td className="p-2">Deprecated (discontinued)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Example */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Example Request</h3>
            <CodeSnippet
              code={calculateReturnsExample}
              language="bash"
              snippetId="calculate-returns-curl"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioDocumentation;
