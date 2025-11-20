import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar } from "../ui/calendar";
import { useState } from "react";

export function Schedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const schedules = [
    {
      id: 1,
      date: "2025-11-20",
      chapter: "第2章",
      title: "React コンポーネント実装",
      time: "09:00-12:00",
      mentor: "田中メンター",
      location: "オンライン",
      status: "進行中",
    },
    {
      id: 2,
      date: "2025-11-21",
      chapter: "第2章",
      title: "Hooks 演習（useState/useEffect）",
      time: "14:00-17:00",
      mentor: "佐藤メンター",
      location: "会議室A",
      status: "未開始",
    },
    {
      id: 3,
      date: "2025-11-22",
      chapter: "第2章",
      title: "API通信とフォーム処理",
      time: "10:00-12:00",
      mentor: "鈴木メンター",
      location: "会議室B",
      status: "未開始",
    },
    {
      id: 4,
      date: "2025-11-18",
      chapter: "第1章",
      title: "システム基礎理解 復習",
      time: "13:00-16:00",
      mentor: "山田メンター",
      location: "オンライン",
      status: "完了",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "進行中":
        return <Badge variant="default">進行中</Badge>;
      case "未開始":
        return <Badge variant="secondary">未開始</Badge>;
      case "完了":
        return <Badge variant="outline">完了</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>研修日程</h1>
        <p className="text-muted-foreground">
          研修スケジュールを確認しましょう
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>研修一覧</CardTitle>
            <CardDescription>全ての研修スケジュール</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-start gap-4 rounded-lg border p-4"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <div className="text-center">
                      <div className="text-xs">
                        {new Date(schedule.date).toLocaleDateString("ja-JP", {
                          month: "numeric",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-xs">
                        {new Date(schedule.date).toLocaleDateString("ja-JP", {
                          weekday: "short",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {schedule.chapter}
                          </Badge>
                        </div>
                        <h3>{schedule.title}</h3>
                        <p className="text-muted-foreground text-sm">
                          {schedule.time} · {schedule.mentor} · {schedule.location}
                        </p>
                      </div>
                      {getStatusBadge(schedule.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>カレンダー</CardTitle>
            <CardDescription>日付を選択して研修を確認</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
