import sqlite3

from flask import request
from werkzeug.exceptions import HTTPException

from what_to_eat.responses import error_response


class ApiError(Exception):
    """业务可预期错误，统一转换为 JSON 响应。"""

    def __init__(self, message, status_code=400, details=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def handle_api_error(error):
        return error_response(error.message, error.status_code, error.details)

    @app.errorhandler(sqlite3.Error)
    def handle_database_error(error):
        return error_response("数据库错误", 500, str(error))

    @app.errorhandler(404)
    def handle_not_found(error):
        message = "接口不存在" if request.path.startswith("/api/") else "页面不存在"
        return error_response(message, 404)

    @app.errorhandler(Exception)
    def handle_unknown_error(error):
        if isinstance(error, HTTPException):
            return error_response(error.description, error.code or 500)
        return error_response("服务器内部错误", 500, str(error))

