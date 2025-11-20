import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Plus, Pencil, Trash2, Search, Users, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Account {
  id: number;
  name: string;
  email: string;
  role: "研修生" | "メンター" | "管理者";
  status: "有効" | "無効";
  joinDate: string;
  trainingStartDate?: string;
  trainingEndDate?: string;
}

export function AdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: 1,
      name: "山田太郎",
      email: "yamada@example.com",
      role: "研修生",
      status: "有効",
      joinDate: "2025-01-15",
      trainingStartDate: "2025-01-20",
      trainingEndDate: "2025-03-20",
    },
    {
      id: 2,
      name: "佐藤花子",
      email: "sato@example.com",
      role: "研修生",
      status: "有効",
      joinDate: "2025-01-20",
    },
    {
      id: 3,
      name: "田中メンター",
      email: "tanaka@example.com",
      role: "メンター",
      status: "有効",
      joinDate: "2024-12-01",
    },
    {
      id: 4,
      name: "鈴木一郎",
      email: "suzuki@example.com",
      role: "研修生",
      status: "無効",
      joinDate: "2025-02-01",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [trainingDateDialog, setTrainingDateDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [trainingStartDate, setTrainingStartDate] = useState("");
  
  const [newAccount, setNewAccount] = useState({
    name: "",
    email: "",
    role: "研修生" as "研修生" | "メンター" | "管理者",
  });

  // 日本の祝日を計算する簡易関数（実際にはライブラリを使用することを推奨）
  const calculateBusinessDays = (startDate: Date, days: number): Date => {
    let currentDate = new Date(startDate);
    let addedDays = 0;
    
    // 日本の主要祝日（2025年）
    const holidays = [
      '2025-01-01', '2025-01-13', '2025-02-11', '2025-02-23', '2025-02-24',
      '2025-03-20', '2025-04-29', '2025-05-03', '2025-05-04', '2025-05-05',
      '2025-07-21', '2025-08-11', '2025-09-15', '2025-09-23', '2025-10-13',
      '2025-11-03', '2025-11-23', '2025-11-24'
    ];
    
    while (addedDays < days) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      const dateString = currentDate.toISOString().split('T')[0];
      
      // 土日と祝日をスキップ
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateString)) {
        addedDays++;
      }
    }
    
    return currentDate;
  };

  const handleSetTrainingDate = () => {
    if (selectedAccount && trainingStartDate) {
      const startDate = new Date(trainingStartDate);
      const endDate = calculateBusinessDays(startDate, 60); // 60営業日
      
      setAccounts(
        accounts.map((account) =>
          account.id === selectedAccount.id
            ? {
                ...account,
                trainingStartDate: trainingStartDate,
                trainingEndDate: endDate.toISOString().split('T')[0],
              }
            : account
        )
      );
      
      setTrainingDateDialog(false);
      setTrainingStartDate("");
      setSelectedAccount(null);
    }
  };

  const handleAddAccount = () => {
    if (newAccount.name && newAccount.email) {
      setAccounts([
        ...accounts,
        {
          id: Date.now(),
          ...newAccount,
          status: "有効",
          joinDate: new Date().toISOString().split("T")[0],
        },
      ]);
      setNewAccount({ name: "", email: "", role: "研修生" });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteAccount = (id: number) => {
    setAccounts(accounts.filter((account) => account.id !== id));
  };

  const toggleAccountStatus = (id: number) => {
    setAccounts(
      accounts.map((account) =>
        account.id === id
          ? {
              ...account,
              status: account.status === "有効" ? "無効" : "有効",
            }
          : account
      )
    );
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const traineeCount = accounts.filter((a) => a.role === "研修生").length;
  const mentorCount = accounts.filter((a) => a.role === "メンター").length;
  const activeTrainingCount = accounts.filter(
    (a) => a.role === "研修生" && a.trainingStartDate
  ).length;

  const getRemainingDays = (account: Account): number | null => {
    if (!account.trainingStartDate || !account.trainingEndDate) return null;
    
    const today = new Date();
    const endDate = new Date(account.trainingEndDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>アカウント管理</h1>
          <p className="text-muted-foreground">
            システムユーザーのアカウントと研修期間を管理します
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              アカウントを追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ユーザーアカウントを追加</DialogTitle>
              <DialogDescription>
                ユーザー情報を入力してアカウントを追加する
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">氏名</Label>
                <Input
                  id="name"
                  placeholder="氏名を入力..."
                  value={newAccount.name}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="メールアドレスを入力..."
                  value={newAccount.email}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">役割</Label>
                <Select
                  value={newAccount.role}
                  onValueChange={(value) =>
                    setNewAccount({
                      ...newAccount,
                      role: value as "研修生" | "メンター" | "管理者",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="研修生">研修生</SelectItem>
                    <SelectItem value="メンター">メンター</SelectItem>
                    <SelectItem value="管理者">管理者</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleAddAccount}>追加</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">研修生数</CardTitle>
            <Users className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div>{traineeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">メンター数</CardTitle>
            <Users className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div>{mentorCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">研修中</CardTitle>
            <Calendar className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div>{activeTrainingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">有効アカウント</CardTitle>
            <Users className="size-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div>{accounts.filter((a) => a.status === "有効").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>全アカウント</CardTitle>
              <CardDescription>合計 {accounts.length} 件のアカウント</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="氏名またはメールで検索..."
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
                <TableHead>氏名</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>役割</TableHead>
                <TableHead>研修期間</TableHead>
                <TableHead>残り日数</TableHead>
                <TableHead>状態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => {
                const remainingDays = getRemainingDays(account);
                return (
                  <TableRow key={account.id}>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>{account.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{account.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {account.trainingStartDate ? (
                        <div className="text-sm">
                          <div>
                            {new Date(account.trainingStartDate).toLocaleDateString("ja-JP")}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            〜 {account.trainingEndDate && new Date(account.trainingEndDate).toLocaleDateString("ja-JP")}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">未設定</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {remainingDays !== null ? (
                        <Badge
                          variant={
                            remainingDays < 0
                              ? "outline"
                              : remainingDays < 10
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {remainingDays < 0 ? "終了" : `残り${remainingDays}日`}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={account.status === "有効" ? "default" : "secondary"}
                      >
                        {account.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {account.role === "研修生" && (
                          <Dialog
                            open={trainingDateDialog && selectedAccount?.id === account.id}
                            onOpenChange={(open) => {
                              setTrainingDateDialog(open);
                              if (open) {
                                setSelectedAccount(account);
                                setTrainingStartDate(account.trainingStartDate || "");
                              } else {
                                setSelectedAccount(null);
                                setTrainingStartDate("");
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Calendar className="size-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>研修開始日を設定</DialogTitle>
                                <DialogDescription>
                                  {account.name} の研修開始日を設定します。
                                  終了日は開始日から60営業日後（土日祝除く）に自動設定されます。
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="training-start">研修開始日</Label>
                                  <Input
                                    id="training-start"
                                    type="date"
                                    value={trainingStartDate}
                                    onChange={(e) => setTrainingStartDate(e.target.value)}
                                  />
                                </div>
                                {trainingStartDate && (
                                  <div className="rounded-lg bg-muted p-4">
                                    <p className="text-sm">
                                      <strong>開始日:</strong>{" "}
                                      {new Date(trainingStartDate).toLocaleDateString("ja-JP", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        weekday: "long",
                                      })}
                                    </p>
                                    <p className="text-sm mt-2">
                                      <strong>終了予定日:</strong>{" "}
                                      {calculateBusinessDays(new Date(trainingStartDate), 60).toLocaleDateString("ja-JP", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        weekday: "long",
                                      })}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      ※ 土日祝日を除く60営業日
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setTrainingDateDialog(false);
                                    setTrainingStartDate("");
                                  }}
                                >
                                  キャンセル
                                </Button>
                                <Button onClick={handleSetTrainingDate}>
                                  設定
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAccountStatus(account.id)}
                        >
                          {account.status === "有効" ? "無効化" : "有効化"}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
