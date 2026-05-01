# DeerFlow 生产环境部署备忘录

## 服务器信息

| 项目 | 值 |
|------|-----|
| IP | 121.43.140.76 |
| 域名 | deerflow.lianhaikeji.com |
| 端口 | 80 |
| OS | Alibaba Cloud Linux 3 (OpenAnolis) |
| 磁盘 | 40G (33G 可用) |
| 内存 | 3.5G |
| Docker | 26.1.3, Compose v2.27.0 |
| 代码路径 | /opt/deer-flow |
| Git 远程 | git@github.com:yutuna/deer-flow.git |

## 配置的模型

| 模型 | 名称 | API |
|------|------|-----|
| Doubao-Seed-2.0 | doubao-seed-2.0 | Volcengine ARK |
| DeepSeek V4 Pro | deepseek-v4-pro | api.deepseek.com |
| DeepSeek V4 Flash | deepseek-v4-flash | api.deepseek.com |

## 更新代码

**方式一 - 本地脚本**（推荐）:
```bash
./scripts/update-server.sh          # 同步代码 + 重建 + 重启
./scripts/update-server.sh status   # 查看状态
./scripts/update-server.sh logs     # 查看日志
./scripts/update-server.sh sync     # 仅同步代码
```

**方式二 - SSH git pull**:
```bash
ssh root@121.43.140.76 'cd /opt/deer-flow && git pull origin main && bash scripts/deploy.sh start'
```

## SSH 管理

```bash
ssh root@121.43.140.76

# 查看容器
docker ps | grep deer-flow

# 查看日志
docker logs deer-flow-gateway --tail 50
docker logs deer-flow-frontend --tail 50

# 重启
cd /opt/deer-flow && bash scripts/deploy.sh start

# 停止
cd /opt/deer-flow && bash scripts/deploy.sh down
```

## 管理员账号

- URL: http://deerflow.lianhaikeji.com
- 用户: admin@deerflow.com
- 密码: admin123456

## 其他

- `.env` 和 `config.yaml` 被 gitignore，需单独同步
- 生产 compose 中 gateway 使用 `--no-sync`（依赖已内置于镜像）
- `DEER_FLOW_TRUSTED_ORIGINS` 需包含部署域名
- 服务器 SSH 密钥需添加到 GitHub 才能 git pull
- Docker 镜像加速已在 /etc/docker/daemon.json 配置
