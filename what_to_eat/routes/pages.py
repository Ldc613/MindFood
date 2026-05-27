from flask import Blueprint, render_template


pages_bp = Blueprint("pages", __name__)


@pages_bp.route("/")
def index():
    return render_template("index.html")


@pages_bp.route("/restaurant/<int:restaurant_id>")
def restaurant_detail_page(restaurant_id):
    return render_template("detail.html", restaurant_id=restaurant_id)


@pages_bp.route("/favorites")
def favorites_page():
    return render_template("favorites.html")

