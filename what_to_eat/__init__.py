from flask import Flask

from config import AppConfig
from what_to_eat.errors import register_error_handlers
from what_to_eat.routes import register_blueprints


def create_app(config_object=AppConfig):
    """创建 Flask 应用，并统一注册配置、路由和异常处理。"""
    app = Flask(
        __name__,
        template_folder="../templates",
        static_folder="../static",
    )
    app.config.from_object(config_object)

    register_blueprints(app)
    register_error_handlers(app)
    register_cors_headers(app)
    return app


def register_cors_headers(app):
    @app.after_request
    def add_cors_headers(response):
        """允许前端页面或 Postman 从其他地址访问接口。"""
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        return response

