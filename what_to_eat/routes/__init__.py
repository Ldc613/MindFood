from what_to_eat.routes.api import api_bp
from what_to_eat.routes.pages import pages_bp


def register_blueprints(app):
    app.register_blueprint(pages_bp)
    app.register_blueprint(api_bp)

