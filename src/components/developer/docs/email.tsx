import { useState } from "react";
import { Mail, Copy, Check, ShieldCheck } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const EmailDocumentation = () => {
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

  const requestExample = `curl -X POST "https://api.fintrackit.my.id/v1/secure/send-email" \\
-H "Authorization: Bearer your_access_token_here" \\
-H "Content-Type: application/json" \\
-d '{
    "recipient_email": "recipient@example.com",
    "subject": "Test Email",
    "body": "<h1>Hello</h1><p>This is a test email.</p>"
}'`;

  const responseExample = `{
    "success": true,
    "message": "Email sent successfully"
}`;

  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight">Email Services</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Complete guide to using our email sending API endpoints
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
            Email services require authentication to maintain security and prevent misuse
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
                <li>All endpoints require a valid Bearer token in the Authorization header</li>
                <li>Requests must include proper JSON payloads</li>
                <li>Response includes status and detailed messages</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Services Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Available Services
          </CardTitle>
          <CardDescription className="text-base">
            List of available email services
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
                    <a href="#send-email-endpoint" className="text-primary hover:underline font-medium">
                      /send-email
                    </a>
                  </td>
                  <td className="p-4">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                      POST
                    </span>
                  </td>
                  <td className="p-4">Send an email using the server's Postfix service</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Send Email Service Documentation */}
      <Card id="send-email-endpoint">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Send Email Service
          </CardTitle>
          <CardDescription className="text-base">
            Send HTML emails through our secure email service
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
                  https://api.fintrackit.my.id/v1/secure/send-email
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
                  <td className="p-2"><code>Authorization</code></td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Bearer token obtained from authentication service</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2"><code>Content-Type</code></td>
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
                  <td className="p-2"><code>recipient_email</code></td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Email address of the recipient</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2"><code>subject</code></td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Subject line of the email</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2"><code>body</code></td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">HTML content of the email</td>
                </tr>
              </tbody>
            </table>
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
              code={requestExample}
              language="bash"
              snippetId="curl"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailDocumentation;