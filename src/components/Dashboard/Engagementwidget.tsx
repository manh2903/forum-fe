import { useState, useMemo } from 'react'
import {
  Box, Paper, Typography, ToggleButton, ToggleButtonGroup,
  Tooltip, Skeleton, Stack, Chip
} from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts'
import { Visibility, Favorite, ChatBubble, TrendingUp } from '@mui/icons-material'
import { alpha } from '@mui/material/styles'

// ── Types ────────────────────────────────────────────────────────────────────
// Shape từ API:
// { topicId, postCount, avgViews, avgLikes, avgComments, totalViews, totalLikes }
// Nếu join Topic: thêm trường topic.name

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: any) => {
  const num = parseFloat(n) || 0
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return Number(num.toFixed(1)).toString()
}

const METRICS: any[] = [
  {
    key: 'ratio',
    label: 'Like/View',
    icon: <TrendingUp sx={{ fontSize: 14 }} />,
    color: '#6366f1',
    desc: 'Tỷ lệ like trên lượt xem (%)',
    getValue: (d: any) => parseFloat(d.avgViews) > 0
      ? ((parseFloat(d.avgLikes) / parseFloat(d.avgViews)) * 100).toFixed(2)
      : '0',
    format: (v: any) => v + '%',
  },
  {
    key: 'avgViews',
    label: 'Lượt xem TB',
    icon: <Visibility sx={{ fontSize: 14 }} />,
    color: '#06b6d4',
    desc: 'Trung bình lượt xem mỗi bài',
    getValue: (d: any) => parseFloat(d.avgViews || 0).toFixed(1),
    format: fmt,
  },
  {
    key: 'avgLikes',
    label: 'Like TB',
    icon: <Favorite sx={{ fontSize: 14 }} />,
    color: '#ec4899',
    desc: 'Trung bình lượt like mỗi bài',
    getValue: (d: any) => parseFloat(d.avgLikes || 0).toFixed(1),
    format: fmt,
  },
  {
    key: 'avgComments',
    label: 'Bình luận TB',
    icon: <ChatBubble sx={{ fontSize: 14 }} />,
    color: '#10b981',
    desc: 'Trung bình bình luận mỗi bài',
    getValue: (d: any) => parseFloat(d.avgComments || 0).toFixed(1),
    format: fmt,
  },
]

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, metric }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const ratio = parseFloat(d.avgViews) > 0
    ? ((parseFloat(d.avgLikes) / parseFloat(d.avgViews)) * 100).toFixed(2)
    : '0'

  return (
    <Paper sx={{ p: 1.5, minWidth: 180, border: '1px solid', borderColor: 'divider', boxShadow: 3 }}>
      <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 1 }}>
        {d.name}
      </Typography>
      <Stack spacing={0.5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">Bài viết</Typography>
          <Typography variant="caption" fontWeight={600}>{d.postCount}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">Like/View</Typography>
          <Typography variant="caption" fontWeight={700} color="#6366f1">{ratio}%</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">TB lượt xem</Typography>
          <Typography variant="caption" fontWeight={600}>{fmt(d.avgViews)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">TB like</Typography>
          <Typography variant="caption" fontWeight={600}>{fmt(d.avgLikes)}</Typography>
        </Box>
      </Stack>
    </Paper>
  )
}

// ── Summary Cards ─────────────────────────────────────────────────────────────
function SummaryCard({ label, value, color, icon }: any) {
  return (
    <Box sx={{
      flex: 1,
      p: 1.5,
      borderRadius: 1.5,
      bgcolor: alpha(color, 0.07),
      border: `1px solid ${alpha(color, 0.15)}`,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    }}>
      <Box sx={{
        width: 30, height: 30, borderRadius: 1,
        bgcolor: alpha(color, 0.15),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color,
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700} sx={{ color }}>
          {value}
        </Typography>
      </Box>
    </Box>
  )
}

// ── Main Widget ───────────────────────────────────────────────────────────────
export default function EngagementWidget({ data, loading }: any) {
  const [activeMetric, setActiveMetric] = useState('ratio')

  const metric = METRICS.find(m => m.key === activeMetric)

  // Chuẩn hoá data: dùng topic.name nếu join, fallback về "Topic #id"
  const chartData = useMemo(() => {
    if (!data?.length) return []
    return data
      .map((d: any) => ({
        ...d,
        name: d.topic?.name || `Topic #${d.topicId}`,
        value: parseFloat(metric.getValue(d)),
      }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 8) // tối đa 8 topic
  }, [data, activeMetric])

  // Tổng hợp toàn site
  const summary = useMemo(() => {
    if (!data?.length) return null
    const totalViews = data.reduce((s: number, d: any) => s + parseFloat(d.totalViews || 0), 0)
    const totalLikes = data.reduce((s: number, d: any) => s + parseFloat(d.totalLikes || 0), 0)
    const totalPosts = data.reduce((s: number, d: any) => s + parseInt(d.postCount || 0), 0)
    return {
      ratio: totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(2) + '%' : '—',
      avgViews: fmt(totalViews / totalPosts),
      avgLikes: fmt(totalLikes / totalPosts),
    }
  }, [data])

  // Màu bar theo rank (đậm → nhạt)
  const getBarColor = (index: number) => {
    const opacity = Math.max(0.35, 1 - index * 0.08)
    return alpha(metric.color, opacity)
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 1, border: '2px solid #cbd5e1', boxShadow: 'none' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
        <Box>
          <Typography variant="h6" fontWeight={800}>
            📊 Tỷ lệ Tương tác theo Chủ đề
          </Typography>
          <Typography variant="caption" color="text.secondary">
            So sánh mức độ tương tác trung bình giữa các topic
          </Typography>
        </Box>
        {summary && (
          <Tooltip title="Like/View ratio toàn site">
            <Chip
              label={`Toàn site: ${summary.ratio}`}
              size="small"
              sx={{
                bgcolor: alpha('#6366f1', 0.1),
                color: '#6366f1',
                fontWeight: 800,
                fontSize: '0.7rem',
                borderRadius: 1,
                border: `1px solid ${alpha('#6366f1', 0.2)}`,
              }}
            />
          </Tooltip>
        )}
      </Box>

      {/* Summary row */}
      {loading ? (
        <Skeleton variant="rounded" height={52} sx={{ mb: 2.5 }} />
      ) : summary && (
        <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
          <SummaryCard label="Like/View" value={summary.ratio} color="#6366f1" icon={<TrendingUp sx={{ fontSize: 16 }} />} />
          <SummaryCard label="TB lượt xem/bài" value={summary.avgViews} color="#06b6d4" icon={<Visibility sx={{ fontSize: 16 }} />} />
          <SummaryCard label="TB like/bài" value={summary.avgLikes} color="#ec4899" icon={<Favorite sx={{ fontSize: 16 }} />} />
        </Stack>
      )}

      {/* Metric selector */}
      <ToggleButtonGroup
        value={activeMetric}
        exclusive
        onChange={(_, v) => v && setActiveMetric(v)}
        size="small"
        sx={{ mb: 2, '& .MuiToggleButton-root': { px: 1.5, py: 0.5, textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, borderColor: '#e2e8f0' } }}
      >
        {METRICS.map(m => (
          <ToggleButton
            key={m.key}
            value={m.key}
            sx={{
              gap: 0.5,
              '&.Mui-selected': {
                bgcolor: alpha(m.color, 0.1),
                color: m.color,
                borderColor: alpha(m.color, 0.3),
                '&:hover': { bgcolor: alpha(m.color, 0.15) },
              },
            }}
          >
            {m.icon}
            {m.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Chart */}
      {loading ? (
        <Skeleton variant="rounded" height={260} />
      ) : chartData.length === 0 ? (
        <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">Chưa có dữ liệu</Typography>
        </Box>
      ) : (
        <Box sx={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
              barSize={18}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                stroke="#f1f5f9"
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={activeMetric === 'ratio' ? (v) => v + '%' : fmt}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                width={90}
              />
              <RechartsTooltip
                content={<CustomTooltip metric={metric} />}
                cursor={{ fill: alpha(metric.color, 0.05) }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((_: any, i: number) => (
                  <Cell key={i} fill={getBarColor(i)} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={activeMetric === 'ratio' ? (v) => v + '%' : fmt}
                  style={{ fontSize: 11, fontWeight: 700, fill: metric.color }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {metric.desc} · Sắp xếp giảm dần · Tối đa 8 chủ đề
      </Typography>
    </Paper>
  )
}