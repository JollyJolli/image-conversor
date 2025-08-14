// JavaScript para el Conversor de Imágenes HEIC

// Variables globales para manejar el estado de la aplicación
let selectedFile = null;
let convertedBlob = null;
let selectedFormat = 'png';

// Obtener referencias a los elementos del DOM
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const convertBtn = document.getElementById('convertBtn');
const loading = document.getElementById('loading');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const resultArea = document.getElementById('resultArea');
const previewImage = document.getElementById('previewImage');
const downloadBtn = document.getElementById('downloadBtn');
const formatRadios = document.querySelectorAll('input[name="format"]');

// Configurar event listeners al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    // Event listener para el área de carga (click)
    uploadArea.addEventListener('click', () => fileInput.click());

    // Event listener para el input de archivo
    fileInput.addEventListener('change', handleFileSelect);

    // Event listeners para drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Event listener para el botón de conversión
    convertBtn.addEventListener('click', convertImage);

    // Event listener para el botón de descarga
    downloadBtn.addEventListener('click', downloadImage);

    // Event listeners para los radio buttons de formato
    formatRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedFormat = e.target.value;
        });
    });
}

// Manejar la selección de archivos
function handleFileSelect(event) {
    const file = event.target.files[0];
    processSelectedFile(file);
}

// Manejar el evento dragover
function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

// Manejar el evento dragleave
function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

// Manejar el evento drop
function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processSelectedFile(files[0]);
    }
}

// Procesar el archivo seleccionado
function processSelectedFile(file) {
    hideMessages();
    
    // Validar que sea un archivo HEIC
    if (!file || !file.name.toLowerCase().endsWith('.heic')) {
        showError('Por favor, selecciona un archivo HEIC válido.');
        return;
    }

    selectedFile = file;
    
    // Mostrar información del archivo
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    fileInfo.innerHTML = `
        <strong>Archivo seleccionado:</strong> ${file.name}<br>
        <strong>Tamaño:</strong> ${fileSize} MB
    `;
    fileInfo.style.display = 'block';
    
    // Habilitar el botón de conversión
    convertBtn.disabled = false;
    
    // Ocultar el área de resultado anterior
    resultArea.style.display = 'none';
}

// Función principal de conversión
async function convertImage() {
    if (!selectedFile) {
        showError('No hay archivo seleccionado.');
        return;
    }

    try {
        // Mostrar indicador de carga
        showLoading();
        convertBtn.disabled = true;

        // Realizar la conversión usando heic2any
        const convertedFile = await heic2any({
            blob: selectedFile,
            toType: `image/${selectedFormat}`,
            quality: 0.9 // Calidad del 90%
        });

        // Guardar el blob convertido
        convertedBlob = convertedFile;

        // Crear URL para la vista previa
        const imageUrl = URL.createObjectURL(convertedBlob);
        previewImage.src = imageUrl;

        // Mostrar el resultado
        hideLoading();
        showSuccess(`¡Imagen convertida exitosamente a ${selectedFormat.toUpperCase()}!`);
        resultArea.style.display = 'block';
        convertBtn.disabled = false;

    } catch (error) {
        console.error('Error durante la conversión:', error);
        hideLoading();
        showError('Error al convertir la imagen. Asegúrate de que el archivo sea un HEIC válido.');
        convertBtn.disabled = false;
    }
}

// Función para descargar la imagen convertida
function downloadImage() {
    if (!convertedBlob) {
        showError('No hay imagen convertida para descargar.');
        return;
    }

    // Crear un enlace de descarga temporal
    const downloadUrl = URL.createObjectURL(convertedBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Generar nombre de archivo basado en el original
    const originalName = selectedFile.name.replace(/\.heic$/i, '');
    link.download = `${originalName}_convertido.${selectedFormat}`;
    
    // Simular click para iniciar descarga
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpiar URL temporal
    URL.revokeObjectURL(downloadUrl);
}

// Funciones auxiliares para mostrar/ocultar mensajes
function showLoading() {
    loading.style.display = 'block';
    hideMessages();
}

function hideLoading() {
    loading.style.display = 'none';
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    successMsg.style.display = 'none';
}

function showSuccess(message) {
    successMsg.textContent = message;
    successMsg.style.display = 'block';
    errorMsg.style.display = 'none';
}

function hideMessages() {
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
}