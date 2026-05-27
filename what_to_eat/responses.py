from flask import jsonify


def success_response(data=None, message="请求成功", status_code=200):
    """统一成功响应格式。"""
    return jsonify({
        "success": True,
        "message": message,
        "data": data,
    }), status_code


def error_response(message, status_code=400, details=None):
    """统一失败响应格式，同时保留 error 字段方便旧代码识别。"""
    payload = {
        "success": False,
        "message": message,
        "error": message,
        "data": None,
    }
    if details:
        payload["details"] = details
    return jsonify(payload), status_code

