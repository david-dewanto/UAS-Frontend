import { useState } from "react";
import { Key, Copy, Check, Lock } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const APIDocumentation = () => {
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

  const curlExample = `curl -X POST "https://api.fintrackit.my.id/v1/auth/token" \\
-H "X-API-Key: your_api_key_here"`;

  const responseExample = `{
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer"
}`;

  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight">Authentication Services</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Complete guide to authenticate and access API endpoints
        </p>
      </div>

      {/* Service Type Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Lock className="h-6 w-6" />
            Endpoint Type: Authentication
          </CardTitle>
          <CardDescription className="text-base">
            Authentication services are the gateway to accessing our API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-base font-medium">
              Base URL: https://api.fintrackit.my.id/v1/auth
            </p>
            <div className="space-y-2">
              <p className="font-semibold">Key Points:</p>
              <ul className="list-disc list-inside space-y-2 text-base">
                <li>Authentication endpoints handle API key validation and token generation</li>
                <li>No prior authentication required to access these endpoints</li>
                <li>Used to obtain access tokens for secure endpoint access</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Services Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Key className="h-6 w-6" />
            Available Services
          </CardTitle>
          <CardDescription className="text-base">
            List of available authentication services
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                    <a href="#token-endpoint" className="text-primary hover:underline font-medium">
                      /token
                    </a>
                  </td>
                  <td className="p-4">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                      POST
                    </span>
                  </td>
                  <td className="p-4">Generate JWT access token using API key</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Token Service Documentation */}
      <Card id="token-endpoint">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Key className="h-6 w-6" />
            Token Generation Service
          </CardTitle>
          <CardDescription className="text-base">
            Service to exchange your API key for a JWT access token
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
                  https://api.fintrackit.my.id/v1/auth/token
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
                  <td className="p-2"><code>X-API-Key</code></td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Your API key obtained from the dashboard</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Request Body */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Request Body</h3>
            <p>No request body required</p>
          </div>

          {/* Response */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Response</h3>
            <p className="mb-2">Success Response (200 OK):</p>
            <CodeSnippet
              code={responseExample}
              language="json"
              snippetId="response"
            />
          </div>

          {/* Example */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Example Request</h3>
            <CodeSnippet
              code={curlExample}
              language="bash"
              snippetId="curl"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIDocumentation;