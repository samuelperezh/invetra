import os
import sys
from dotenv import load_dotenv
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options

# Cargar variables de entorno
if getattr(sys, 'frozen', False):
    # Si el script está empaquetado con PyInstaller
    dotenv_path = os.path.join(sys._MEIPASS, '.env')
else:
    # Si el script se está ejecutando sin empaquetar
    dotenv_path = os.path.join(os.path.dirname(__file__), '.env')

load_dotenv(dotenv_path)

base_url = os.getenv('BASE_URL')
admin_email = os.getenv('ADMIN_EMAIL')
admin_password = os.getenv('ADMIN_PASSWORD')

# Obtener la ruta completa del archivo Excel
if getattr(sys, 'frozen', False):
    # Si el script está empaquetado con PyInstaller
    excel_path = os.path.join(sys._MEIPASS, 'productos.xlsx')
else:
    # Si el script se está ejecutando sin empaquetar
    excel_path = os.path.join(os.path.dirname(__file__), 'productos.xlsx')

# Cargar el archivo Excel
df = pd.read_excel(excel_path)

# Configurar las opciones de Chrome
chrome_options = Options()
chrome_service = ChromeService(ChromeDriverManager().install())

# Configurar el controlador de Selenium usando webdriver_manager
driver = webdriver.Chrome(service=chrome_service, options=chrome_options)

# Navegar a la página de login
driver.get(f'{base_url}/login')

# Esperar a que la página cargue completamente
wait = WebDriverWait(driver, 10)

# Realizar el login
try:
    # Esperar a que los campos de login estén disponibles
    email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="email"][id="email"]')))
    password_input = driver.find_element(By.CSS_SELECTOR, 'input[type="password"][id="contraseña"]')
    
    # Ingresar credenciales
    email_input.send_keys(admin_email)
    password_input.send_keys(admin_password)
    
    # Hacer clic en el botón del combobox de rol para abrir el dropdown
    role_button = driver.find_element(By.CSS_SELECTOR, 'button[role="combobox"][id="rol"]')
    role_button.click()
    
    # Esperar y hacer clic en la opción "Admin" del dropdown visible
    admin_option = wait.until(EC.element_to_be_clickable((By.XPATH, "//div[@role='option']//span[text()='Admin']")))
    admin_option.click()
    
    # Verificar que el rol seleccionado es "Admin"
    selected_role = driver.find_element(By.CSS_SELECTOR, 'button#rol span').text
    if selected_role != "Admin":
        raise Exception("No se pudo seleccionar el rol Admin")
    
    # Hacer clic en el botón de login
    login_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Iniciar')]")
    login_button.click()
    
    # Esperar a que se complete el login y redirija
    wait.until(EC.url_to_be(f'{base_url}/admin'))
except Exception as e:
    print(f"Error durante el login: {e}")
    driver.quit()
    exit(1)

# Esperar a que la página cargue completamente
wait = WebDriverWait(driver, 10)

# Iterar sobre cada fila del DataFrame y crear productos
for index, row in df.iterrows():
    # Hacer clic en el botón "Agregar Producto"
    add_product_button = wait.until(EC.element_to_be_clickable((By.XPATH, '//button[text()="Agregar Producto"]')))
    add_product_button.click()

    # Llenar el formulario de creación de producto
    wait.until(EC.visibility_of_element_located((By.NAME, 'nombre'))).send_keys(row['nombre'])
    driver.find_element(By.NAME, 'codigo_barras').send_keys(row['codigo_barras'])
    driver.find_element(By.NAME, 'imagen_url').send_keys(row['imagen_url'])
    driver.find_element(By.NAME, 'cantidad_disponible').send_keys(str(row['cantidad_disponible']))

    # Hacer clic en el botón "Crear Producto"
    create_button = driver.find_element(By.XPATH, '//button[text()="Crear Producto"]')
    create_button.click()

    # Esperar a que el modal se cierre
    wait.until(EC.invisibility_of_element_located((By.XPATH, '//h2[text()="Agregar Nuevo Producto"]')))

# Cerrar el navegador
driver.quit()