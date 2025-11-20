import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { FileText, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface Report {
  id: number;
  traineeName: string;
  date: string;
  title: string;
  content: string;
  status: "提出済み" | "未提出";
}

export function AdminDailyReport() {
  const [reports] = useState<Report[]>([
    {
      id: 1,
      traineeName: "山田太郎",
      date: "2025-11-19",
      title: "React Hooks 学習の振り返り",
      content: "今日は useState と useEffect について学習しました。状態管理についてより深く理解することができました。実際に操作してみて、useEffect の依存配列が非常に重要であることがわかりました...",
      status: "提出済み",
    },
    {
      id: 2,
      traineeName: "佐藤花子",
      date: "2025-11-19",
      title: "TypeScript 基礎の復習",
      content: "TypeScript の基本的な型システムを復習しました。interface と type の違いについて学びました。いくつかの例を実装して理解を深めました...",
      status: "提出済み",
    },
    {
      id: 3,
      traineeName: "鈴木一郎",
      date: "2025-11-19",
      title: "プロジェクト開発の進捗",
      content: "個人プロジェクトの企画を始めました。使用する技術スタックを決定し、基本的なプロジェクト構造を完成させました...",
      status: "提出済み",
    },
    {
      id: 4,
      traineeName: "田中美咲",
      date: "2025-11-19",
      title: "",
      content: "",
      status: "未提出",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredReports = reports.filter(
    (report) =>
      report.traineeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const submittedCount = reports.filter((r) => r.status === "提出済み").length;
  const totalCount = reports.length;

  return (
    <div className="space-y-6">
      <div>
        <h1>日報管理</h1>
        <p className="text-muted-foreground">
          研修生の日報を確認・管理します
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">総日報数</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div>{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">提出済み</CardTitle>
            <FileText className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div>{submittedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">提出率</CardTitle>
            <FileText className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div>{Math.round((submittedCount / totalCount) * 100)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>日報一覧</CardTitle>
              <CardDescription>本日提出された日報</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="研修生名またはタイトルで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>研修生</TableHead>
                <TableHead>日付</TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead>状態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.traineeName}</TableCell>
                  <TableCell>
                    {new Date(report.date).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell>
                    {report.title || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        report.status === "提出済み" ? "default" : "secondary"
                      }
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {report.status === "提出済み" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            確認
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{report.title}</DialogTitle>
                            <DialogDescription>
                              {report.traineeName} ·{" "}
                              {new Date(report.date).toLocaleDateString("ja-JP")}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <p className="text-muted-foreground whitespace-pre-wrap">
                              {report.content}
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
