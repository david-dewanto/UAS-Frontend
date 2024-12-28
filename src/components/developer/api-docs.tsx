import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const APIDocumentation = () => {
  const sections = [
    {
      title: "Introduction",
      content: "Welcome to the API documentation. This API allows you to access real-time and historical stock data from the Indonesian Stock Exchange (IDX).",
    },
    {
      title: "Authentication",
      content: "All API endpoints require authentication using your API key. Include your API key in the headers of your requests.",
      code: `
curl -X GET "https://api.example.com/v1/stocks" \\
-H "Authorization: Bearer YOUR_API_KEY"
      `,
    },
    {
      title: "Rate Limits",
      content: "The API has rate limits based on your subscription tier:\n- Basic: 100 requests/minute\n- Pro: 1000 requests/minute\n- Enterprise: Custom limits",
    },
    {
      title: "Endpoints",
      subsections: [
        {
          title: "Get Stock List",
          method: "GET",
          endpoint: "/v1/stocks",
          description: "Retrieve a list of all available stocks on IDX",
        },
        {
          title: "Get Stock Details",
          method: "GET",
          endpoint: "/v1/stocks/{symbol}",
          description: "Get detailed information about a specific stock",
        },
        {
          title: "Get Historical Data",
          method: "GET",
          endpoint: "/v1/stocks/{symbol}/historical",
          description: "Retrieve historical price data for a stock",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">API Documentation</h2>
        <p className="text-muted-foreground">Complete guide to using our API</p>
      </div>

      {sections.map((section, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
            {section.content && (
              <CardDescription className="whitespace-pre-line">
                {section.content}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {section.code && (
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{section.code}</code>
              </pre>
            )}
            {section.subsections && (
              <div className="space-y-4">
                {section.subsections.map((subsection, subIndex) => (
                  <div key={subIndex}>
                    <h3 className="text-lg font-semibold mb-2">{subsection.title}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                          {subsection.method}
                        </span>
                        <code className="bg-muted px-2 py-1 rounded">
                          {subsection.endpoint}
                        </code>
                      </div>
                      <p className="text-muted-foreground">{subsection.description}</p>
                    </div>
                    {subIndex < section.subsections.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default APIDocumentation;