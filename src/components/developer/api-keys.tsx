import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Copy, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { apiKeyService } from '@/lib/apiKey';
import { authService } from '@/lib/auth';

const APIKeySkeleton = () => {
  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-6 w-96" />
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const APIKeys = () => {
  const user = authService.getCurrentUser();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Set initial loading state to true
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    application_name: "",
    organization: "",
    phone_number: "",
  });
  const [errors, setErrors] = useState({
    application_name: "",
    organization: "",
    phone_number: "",
  });

  // Simulate loading state (you can replace this with real data fetching)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const validateForm = () => {
    const newErrors = {
      application_name: "",
      organization: "",
      phone_number: "",
    };
    let isValid = true;

    if (!formData.application_name.trim()) {
      newErrors.application_name = "Application name is required";
      isValid = false;
    }

    if (!formData.organization.trim()) {
      newErrors.organization = "Organization is required";
      isValid = false;
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
      isValid = false;
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone_number.trim())) {
      newErrors.phone_number = "Please enter a valid phone number";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const generateApiKey = async () => {
    if (!user) {
      setError("User data not found");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await apiKeyService.generateApiKey({
        email: user.email,
        full_name: user?.email?.split('@')[0] || 'User',
        ...formData
      });
      
      if (!response.api_key) {
        throw new Error("Failed to generate API key. Please try again later.");
      }
      
      setApiKey(response.api_key);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (apiKey) {
      try {
        await navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        setError("Failed to copy to clipboard");
      }
    }
  };

  // Show skeleton while loading
  if (loading) {
    return <APIKeySkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight">API Keys</h1>
        <p className="text-xl text-muted-foreground mt-2">Manage your API keys for developer access</p>
      </div>

      {error && (
        <Alert variant="destructive" className="flex items-center">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Key className="h-5 w-5" />
            Your API Keys
          </CardTitle>
          <CardDescription className="text-base">
            Use these keys to authenticate your API requests. Keep them secure and never share them publicly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!apiKey ? (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label htmlFor="application_name" className="flex items-baseline gap-1">
                    Application Name
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="application_name"
                    name="application_name"
                    value={formData.application_name}
                    onChange={handleInputChange}
                    placeholder="My Amazing App"
                    className={errors.application_name ? "border-red-500" : ""}
                  />
                  {errors.application_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.application_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="organization" className="flex items-baseline gap-1">
                    Organization
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    placeholder="Your Company Name"
                    className={errors.organization ? "border-red-500" : ""}
                  />
                  {errors.organization && (
                    <p className="text-sm text-red-500 mt-1">{errors.organization}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone_number" className="flex items-baseline gap-1">
                    Phone Number
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    className={errors.phone_number ? "border-red-500" : ""}
                  />
                  {errors.phone_number && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone_number}</p>
                  )}
                </div>
              </div>

              <Button 
                onClick={generateApiKey} 
                disabled={loading || !formData.application_name || !formData.organization || !formData.phone_number}
                className="w-full"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                Generate API Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">API Key for {formData.application_name}</h3>
                  <p className="text-base text-muted-foreground my-1">
                    <span className="font-bold text-red-600 block mb-2">Please save this Key, it will be only shown once!</span>
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateApiKey}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Rotate Key
                </Button>
              </div>
              <div className="flex gap-2">
                <Input 
                  type="password" 
                  value={apiKey} 
                  readOnly 
                  className="font-mono"
                />
                <Button 
                  variant="outline"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied && (
                <p className="text-sm text-green-600">Copied to clipboard!</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default APIKeys;