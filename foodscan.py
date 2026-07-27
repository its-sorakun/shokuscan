from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_restx import Api, Resource, fields
from services import parse_barcode, analyze_nutrition
from utils import load_env
from typing import Any, Dict

load_env()

app = Flask(__name__)
CORS(app)

# Initialize Flask-RestX API with Swagger UI
api = Api(
    app,
    version='1.0',
    title='FoodScanner API',
    description='API for scanning food barcodes and analyzing nutritional information',
    doc='/api/docs',  # Swagger UI will be available at this endpoint
    prefix='/api'
)

# Create namespaces for organizing endpoints
main_ns = api.namespace('', description='Main operations')
scan_ns = api.namespace('scan', description='Barcode scanning operations')

# Define models for request/response documentation
barcode_model = scan_ns.model('BarcodeInput', {
    'barcode': fields.String(required=True, description='The barcode to scan', example='8904327600924')
})

analysis_model = scan_ns.model('AnalysisOutput', {
    'output': fields.String(description='Nutritional analysis of the product')
})

error_model = scan_ns.model('ErrorResponse', {
    'status': fields.String(description='Error status'),
    'message': fields.String(description='Error message')
})

# Routes for HTML, CSS, and JS
@app.route('/')
def main() -> Any:
    """Render the main scanner page."""
    return render_template('foodscan.html')

@app.route('/foodscan.css')
def return_css() -> Any:
    """Return the CSS file."""
    return render_template('foodscan.css')

@app.route('/foodscanner.js')
def return_js() -> Any:
    """Return the JavaScript file."""
    return render_template('foodscanner.js')

# API endpoints with Swagger documentation
@scan_ns.route('')
class BarcodeScanner(Resource):
    @scan_ns.expect(barcode_model)
    @scan_ns.response(200, 'Success', analysis_model)
    @scan_ns.response(400, 'Invalid Input', error_model)
    def post(self) -> Dict[str, Any]:
        """Scan a barcode and return nutritional analysis."""
        data = request.json
        barcode = data.get('barcode')
        
        if not barcode:
            return {"status": "error", "message": "No barcode found"}, 400
            
        product_info = parse_barcode(barcode)
        output = analyze_nutrition(product_info)
        print(f"Processed barcode: {barcode}")
        
        return {"output": output}

# Add a direct route for backward compatibility
@app.route('/scan', methods=['POST'])
def legacy_scan():
    data = request.json
    barcode = data.get('barcode')
    if barcode:
        print(f"Processing barcode: {barcode}")
        product_info = parse_barcode(barcode)
        output = analyze_nutrition(product_info)
        return {"output": output}
    else:
        return jsonify({"status": "error", "message": "No barcode found"}), 400

if __name__ == '__main__':
    # Enable debug mode to see detailed error messages
    app.run(debug=True, port=5000)