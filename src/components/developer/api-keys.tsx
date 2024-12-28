import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Key, Copy, RefreshCw } from "lucide-react";

const APIKeys = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">API Keys</h2>
        <p className="text-muted-foreground">Manage your API keys for developer access</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Your API Keys
          </CardTitle>
          <CardDescription>
            Use these keys to authenticate your API requests. Keep them secure and never share them publicly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Production Key */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Generate API Key</h3>
                <p className="text-sm text-muted-foreground">Use this key for your application</p>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Rotate Key
              </Button>
            </div>
            <div className="flex gap-2">
              <Input 
                type="password" 
                value="sk_prod_123456789" 
                readOnly 
                className="font-mono"
              />
              <Button variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          
        </CardContent>
      </Card>
    </div>
  );
};

export default APIKeys;