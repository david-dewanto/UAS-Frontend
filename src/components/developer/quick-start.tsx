import { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Key,
  Lock,
  Code,
  Link,
  BookOpen,
  ShieldCheck,
  Users,
  Workflow,
  Timer
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import apiflow from "@/assets/api-flow.svg";

const QuickStartSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="border-b pb-6">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Prerequisites Card Skeleton */}
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>

      {/* Authentication Flow Card Skeleton */}
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>

      {/* Authentication Steps Card Skeleton */}
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-96" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples Card Skeleton */}
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits Card Skeleton */}
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints Card Skeleton */}
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const QuickStart = () => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
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
      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 right-2"
        onClick={() => copyToClipboard(code, snippetId)}
      >
        {copiedSnippet === snippetId ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  // Code snippets definitions remain the same...
  const authTokenCurlSnippet = `curl -X POST "https://api.fintrackit.my.id/v1/auth/token" \\
-H "X-API-Key: your_api_key_here"`;

  const authTokenResponseSnippet = `{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
  }`;

  const secureEndpointSnippet = `curl -X GET "https://api.fintrackit.my.id/v1/secure/stocks" \\
-H "Authorization: Bearer your_access_token_here"`;

  const pythonSnippet = `import requests

# Your API key obtained from the dashboard
API_KEY = "your_api_key_here"

# Get access token
auth_response = requests.post(
    "https://api.fintrackit.my.id/v1/auth/token",
    headers={"X-API-Key": API_KEY}
)
access_token = auth_response.json()["access_token"]

# Make request to secure endpoint
headers = {"Authorization": f"Bearer {access_token}"}
response = requests.get(
    "https://api.fintrackit.my.id/v1/secure/stocks",
    headers=headers
)
data = response.json()`;

  const javascriptSnippet = `// Using fetch API
const API_KEY = 'your_api_key_here';

// Get access token
const getToken = async () => {
  const response = await fetch('https://api.fintrackit.my.id/v1/auth/token', {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY
    }
  });
  const data = await response.json();
  return data.access_token;
};

// Make request to secure endpoint
const makeSecureRequest = async () => {
  const token = await getToken();
  const response = await fetch('https://api.fintrackit.my.id/v1/secure/stocks', {
    headers: {
      'Authorization': \`Bearer \${token}\`
    }
  });
  const data = await response.json();
  return data;
};`;

  const rateLimitErrorSnippet = `{
  "status_code": 429,
  "detail": "Rate limit exceeded. Please try again later. (150 request / hour for Public Endpoints)"
}`;

  if (loading) {
    return <QuickStartSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight">Quick Start Guide</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Get started with the FinTrackIt API in minutes
        </p>
      </div>

      {/* Prerequisites Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Prerequisites
          </CardTitle>
          <CardDescription className="text-base">
            Before you begin, ensure you have the following requirements:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc list-inside space-y-2 text-base">
            <li>
              Generated an API key from the{" "}
              <span className="font-semibold">API Keys page</span>
            </li>
            <li>
              <span className="font-semibold">Saved your API key securely</span>{" "}
              - it won't be shown again
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Authentication Flow Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Workflow className="h-6 w-6" />
            Authentication Flow
          </CardTitle>
          <CardDescription className="text-base">
            Overview of the authentication process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-4">
            <div className="p-4 bg-muted rounded-lg bg-white max-w-2xl w-full">
              <img
                src={apiflow}
                alt="API Authentication Flow Diagram"
                className="w-full"
              />
            </div>
          </div>
          <Alert className="border-red-200 bg-red-50 mt-4">
            <AlertDescription className="text-red-500">
              Do not include Authorization Bearer token for public endpoints. Use Bearer tokens only for accessing secure endpoints, not API keys.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Authentication Steps Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Lock className="h-6 w-6" />
            Authentication Steps
          </CardTitle>
          <CardDescription className="text-base">
            Follow these steps to authenticate your API requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Step 1: Get Access Token</h3>
            <p className="text-base">
              Exchange your API key for an access token:
            </p>
            <CodeSnippet
              code={authTokenCurlSnippet}
              language="bash"
              snippetId="auth-curl"
            />
            <p className="text-base mt-4">Response:</p>
            <CodeSnippet
              code={authTokenResponseSnippet}
              language="json"
              snippetId="auth-response"
            />

            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-500">
                Access tokens expire after 1 hour. Your application should
                handle token refresh when needed.
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              Step 2: Use the Access Token
            </h3>
            <p className="text-base">
              Include the access token in the Authorization header for secure
              endpoints:
            </p>
            <CodeSnippet
              code={secureEndpointSnippet}
              language="bash"
              snippetId="secure-curl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Code Examples Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Code className="h-6 w-6" />
            Code Examples
          </CardTitle>
          <CardDescription className="text-base">
            Complete examples in different programming languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="python" className="w-full">
            <TabsList>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            </TabsList>
            <TabsContent value="python">
              <CodeSnippet
                code={pythonSnippet}
                language="python"
                snippetId="python-example"
              />
            </TabsContent>
            <TabsContent value="javascript">
              <CodeSnippet
                code={javascriptSnippet}
                language="javascript"
                snippetId="js-example"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Rate Limits Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Timer className="h-6 w-6" />
            Rate Limits
          </CardTitle>
          <CardDescription className="text-base">
            Understanding API rate limits and handling rate-limited requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Request Limits</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Public Endpoints</h4>
                <p className="text-base">Maximum 150 requests per hour</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Secure Endpoints</h4>
                <p className="text-base">Maximum 75 requests per hour</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Rate Limit Response</h3>
              <p className="text-base">
                When rate limit is exceeded, the API will respond with a 429 status code:
              </p>
              <CodeSnippet
                code={rateLimitErrorSnippet}
                language="json"
                snippetId="rate-limit-error"
              />
            </div>

            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-500">
                You should implement proper rate limit handling in your application to ensure smooth operation. Consider implementing retry mechanisms with exponential backoff when rate limits are hit.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Link className="h-6 w-6" />
            API Endpoints
          </CardTitle>
          <CardDescription className="text-base">
            Overview of available endpoints and their authentication
            requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Key className="h-5 w-5" />
                Authentication Endpoints
              </h3>
              <p className="text-base font-medium mb-2">
                Base URL: https://api.fintrackit.my.id/v1/auth
              </p>
              <ul className="list-disc list-inside space-y-2 text-base">
                <li>Requires API Key in X-API-Key header</li>
                <li>Used for obtaining access tokens</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Public Endpoints
              </h3>
              <p className="text-base font-medium mb-2">
                Base URL: https://api.fintrackit.my.id/v1/public
              </p>
              <ul className="list-disc list-inside space-y-2 text-base">
                <li>No authentication required</li>
                <li>Access to public information and market data</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Secure Endpoints
              </h3>
              <p className="text-base font-medium mb-2">
                Base URL: https://api.fintrackit.my.id/v1/secure
              </p>
              <ul className="list-disc list-inside space-y-2 text-base">
                <li>Requires Bearer token in Authorization header</li>
                <li>Access to protected resources and operations</li>
                <li>Token must be refreshed every hour</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStart;