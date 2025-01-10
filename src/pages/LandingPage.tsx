import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ChartPie, Clock, ChartCandlestick } from "lucide-react";
import logo from "@/assets/logo.svg";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const chartData = [
    { date: "Jan", IHSG: 7200, BBCA: 7000, TLKM: 2000 },
    { date: "Feb", IHSG: 9000, BBCA: 12000, TLKM: 5000 },
    { date: "Mar", IHSG: 7300, BBCA: 9750, TLKM: 2500 },
    { date: "Apr", IHSG: 7600, BBCA: 9900, TLKM: 4000 },
    { date: "May", IHSG: 10000, BBCA: 15000, TLKM: 3000 },
    { date: "Jun", IHSG: 7900, BBCA: 10300, TLKM: 3500 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto flex items-center justify-between h-20 px-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-12 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <Button asChild className="text-lg">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Track Your IDX Portfolio Like a Pro
            </h1>
            <p className="text-xl text-muted-foreground">
              Same day updates, advanced analytics, and powerful tools to
              optimize your Indonesian stock investments.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="gap-2">
                <Link to="/login">Get Started for Free</Link>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card className="backdrop-blur-sm bg-card/50">
            <CardContent className="p-6">
              <div className="h-[60vh]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${value.toLocaleString()}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="IHSG"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="BBCA"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="TLKM"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mt-36">
          <Card className="backdrop-blur-sm bg-card/50">
            <CardContent className="p-6 space-y-2">
              <Clock className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold">Same Day Tracking</h3>
              <p className="text-muted-foreground">
                Guaranteed same day updates from IDX with price alerts and
                portfolio performance
              </p>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-sm bg-card/50">
            <CardContent className="p-6 space-y-2">
              <ChartPie className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Technical indicators, fundamental analysis, and market insights
              </p>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-sm bg-card/50">
            <CardContent className="p-6 space-y-2">
              <ChartCandlestick className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold">Portfolio Optimization</h3>
              <p className="text-muted-foreground">
                Risk analysis, diversification metrics, and rebalancing tools
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
