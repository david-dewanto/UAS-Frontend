import { useState } from "react";
import { ListChecks, Copy, Check, Users, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const CompaniesDocumentation = () => {
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

  const symbolsResponseExample = `{
    "symbols": [
        "AALI",
        "ABBA",
        "ABDA",
        // ... more symbols
        "ZBRA"
    ],
    "count": 825
}`;

  const companyResponseExample = `{
    "symbol": "BBCA",
    "company_name": "Bank Central Asia Tbk",
    "sector": "Financial Services",
    "industry": "Banks - Regional",
    "market_cap": 876543210000,
    "description": "PT Bank Central Asia Tbk provides various banking and financial services...",
    "last_updated": "2024-01-09T08:30:00Z"
}`;

  const symbolsCurlExample = `curl -X GET "https://api.fintrackit.my.id/v1/public/companies/symbols"`;

  const companyDetailsCurlExample = `curl -X GET "https://api.fintrackit.my.id/v1/public/companies/BBCA"`;

  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Companies Information Endpoints
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Access public information about companies listed on IDX
        </p>
      </div>

      {/* Service Type Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Users className="h-6 w-6" />
            Endpoint Type: Public
          </CardTitle>
          <CardDescription className="text-base">
            Public endpoints providing access to company information and market
            data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-base font-medium">
              Base URL: https://api.fintrackit.my.id/v1/public
            </p>
            <div className="space-y-2">
              <p className="font-semibold">Key Points:</p>
              <ul className="list-disc list-inside space-y-2 text-base">
                <li>No authentication required to access these endpoints</li>
                <li>Company data is cached and updated weekly</li>
                <li>Provides access to IDX listed companies information</li>
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

      {/* Company Services Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <ListChecks className="h-6 w-6" />
            Available Services
          </CardTitle>
          <CardDescription className="text-base">
            List of available company information services
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
                      href="#symbols-endpoint"
                      className="text-primary hover:underline font-medium"
                    >
                      /companies/symbols
                    </a>
                  </td>
                  <td className="p-4">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                      GET
                    </span>
                  </td>
                  <td className="p-4">Get all IDX Composite ticker symbols</td>
                </tr>
                <tr className="border-t">
                  <td className="p-4">
                    <a
                      href="#company-details-endpoint"
                      className="text-primary hover:underline font-medium"
                    >
                      /companies/{"{symbol}"}
                    </a>
                  </td>
                  <td className="p-4">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                      GET
                    </span>
                  </td>
                  <td className="p-4">
                    Get detailed information for a specific company
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Symbols Endpoint Documentation */}
      <Card id="symbols-endpoint">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Company Symbols Service
          </CardTitle>
          <CardDescription className="text-base">
            Retrieve all available IDX stock symbols
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
                  https://api.fintrackit.my.id/v1/public/companies/symbols
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
            <p>No headers required</p>
          </div>

          {/* Response */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Response</h3>
            <p className="mb-2">Success Response (200 OK):</p>
            <CodeSnippet
              code={symbolsResponseExample}
              language="json"
              snippetId="symbols-response"
            />
          </div>

          {/* Example */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Example Request</h3>
            <CodeSnippet
              code={symbolsCurlExample}
              language="bash"
              snippetId="symbols-curl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Company Details Endpoint Documentation */}
      <Card id="company-details-endpoint">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Company Details Service
          </CardTitle>
          <CardDescription className="text-base">
            Retrieve detailed information about a specific company
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
                  https://api.fintrackit.my.id/v1/public/companies/{"{symbol}"}
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

          {/* Path Parameters */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Path Parameters</h3>
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2">Parameter</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Required</th>
                  <th className="text-left p-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">
                    <code>symbol</code>
                  </td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
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
              code={companyResponseExample}
              language="json"
              snippetId="company-response"
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
                    <td className="p-2">Company's stock symbol</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>company_name</code>
                    </td>
                    <td className="p-2">string</td>
                    <td className="p-2">Full legal name of the company</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>sector</code>
                    </td>
                    <td className="p-2">string | null</td>
                    <td className="p-2">Company's business sector</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>industry</code>
                    </td>
                    <td className="p-2">string | null</td>
                    <td className="p-2">Specific industry classification</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>market_cap</code>
                    </td>
                    <td className="p-2">number | null</td>
                    <td className="p-2">Market capitalization in IDR</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>description</code>
                    </td>
                    <td className="p-2">string | null</td>
                    <td className="p-2">
                      Brief description of company's business
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">
                      <code>last_updated</code>
                    </td>
                    <td className="p-2">string</td>
                    <td className="p-2">
                      Timestamp of last data update (ISO 8601)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Error Responses */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Error Responses</h3>
            <div className="space-y-4">
              <div>
                <p className="mb-2">Not Found (404):</p>
                <CodeSnippet
                  code={`{
    "detail": "Symbol INVALID not found in IDX Composite"
}`}
                  language="json"
                  snippetId="error-404"
                />
              </div>
            </div>
          </div>

          {/* Example */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Example Request</h3>
            <CodeSnippet
              code={companyDetailsCurlExample}
              language="bash"
              snippetId="company-curl"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompaniesDocumentation;
