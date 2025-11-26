import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Export Module for PocketRescue
 * Handles PDF and PNG export of Field Action Cards
 *
 * PRIVACY GUARANTEE:
 * - Exports are created locally using html2canvas and jsPDF
 * - No data is sent to any external server during export
 * - Exported files are stored only on the user's device
 * - User has full control over where files are saved
 */

/**
 * Convert canvas elements to images for export compatibility
 * Captures canvas from original DOM before cloning
 * @param {HTMLElement} originalElement - The original card element
 * @param {HTMLElement} clonedElement - The cloned card element
 */
function convertCanvasToImage(originalElement, clonedElement) {
  const originalCanvases = originalElement.querySelectorAll('canvas')
  const clonedCanvases = clonedElement.querySelectorAll('canvas')
  
  console.log(`Found ${originalCanvases.length} canvas elements to convert`)
  
  originalCanvases.forEach((originalCanvas, index) => {
    try {
      // Get canvas dimensions from original
      const width = originalCanvas.width || 60
      const height = originalCanvas.height || 60
      
      console.log(`Converting canvas ${index}: ${width}x${height}`)
      
      // Get the data URL from the original canvas (which is rendered)
      const dataUrl = originalCanvas.toDataURL('image/png')
      console.log(`Canvas data URL length: ${dataUrl.length}`)
      
      // Create image element
      const img = document.createElement('img')
      img.src = dataUrl
      img.style.width = width + 'px'
      img.style.height = height + 'px'
      img.style.display = 'block'
      img.style.border = '2px solid #e5e7eb'
      img.style.borderRadius = '0.375rem'
      img.style.padding = '4px'
      img.style.backgroundColor = 'white'
      img.style.boxSizing = 'border-box'
      
      // Replace canvas in cloned element with image
      if (clonedCanvases[index]) {
        clonedCanvases[index].parentNode.replaceChild(img, clonedCanvases[index])
        console.log(`Canvas ${index} replaced with image in cloned element`)
      }
    } catch (err) {
      console.error('Failed to convert canvas to image:', err)
    }
  })
}

/**
 * Create a clean export container with inline styles
 * @param {HTMLElement} cardElement - The original card element
 * @returns {HTMLElement} A new container with inline-styled content
 */
function createExportContainer(cardElement) {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '-9999px'
  container.style.width = '600px'
  container.style.backgroundColor = 'white'
  container.style.padding = '40px'
  container.style.boxSizing = 'border-box'
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif'
  container.style.lineHeight = '1.5'

  // Clone and clean the card
  const clonedCard = cardElement.cloneNode(true)
  
  // Convert canvas elements (like QR codes) to images
  // Pass both original and cloned elements so we can capture from original
  convertCanvasToImage(cardElement, clonedCard)
  
  // Apply inline styles to override Tailwind
  clonedCard.style.width = '100%'
  clonedCard.style.maxWidth = 'none'
  clonedCard.style.margin = '0'
  clonedCard.style.padding = '0'
  clonedCard.style.boxShadow = 'none'
  clonedCard.style.borderRadius = '0'
  clonedCard.style.aspectRatio = 'auto'
  clonedCard.style.border = 'none'
  clonedCard.style.backgroundColor = 'white'

  // Fix all child elements
  const allElements = clonedCard.querySelectorAll('*')
  allElements.forEach((el) => {
    // Preserve text content and basic structure
    el.style.boxSizing = 'border-box'
    
    // Ensure visibility
    el.style.visibility = 'visible'
    el.style.opacity = '1'
    
    // Fix text truncation issues
    if (el.style.overflow === 'hidden' || el.classList.contains('truncate')) {
      el.style.overflow = 'visible'
      el.style.textOverflow = 'clip'
      el.style.whiteSpace = 'normal'
      el.style.wordWrap = 'break-word'
    }

    // Ensure images display properly
    if (el.tagName === 'IMG') {
      el.style.maxWidth = '100%'
      el.style.height = 'auto'
      el.style.display = 'block'
    }

    // Fix button styling for export
    if (el.tagName === 'BUTTON') {
      el.style.display = 'none'
    }

    // Fix modal/overlay elements
    if (el.classList.contains('fixed') || el.classList.contains('absolute')) {
      el.style.position = 'static'
    }
    
    // Ensure QR code container is visible
    if (el.classList.contains('rounded') && el.classList.contains('border-gray-200')) {
      el.style.display = 'block'
      el.style.visibility = 'visible'
      el.style.opacity = '1'
    }
  })

  container.appendChild(clonedCard)
  return container
}

/**
 * Export a card element as a PDF file
 * PRIVACY: Local export only, no server transmission
 * @param {HTMLElement} cardElement - The DOM element to capture
 * @param {string} filename - The filename for the PDF (without extension)
 * @returns {Promise<void>}
 */
export async function exportCardToPDF(cardElement, filename) {
  try {
    const exportContainer = createExportContainer(cardElement)
    document.body.appendChild(exportContainer)

    // Wait a moment for all elements to render
    await new Promise(resolve => setTimeout(resolve, 100))

    // Capture with optimized settings
    const canvas = await html2canvas(exportContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 600,
      windowHeight: 1200,
      allowTaint: true,
      onclone: (clonedDocument) => {
        console.log('html2canvas cloned document')
      },
    })

    document.body.removeChild(exportContainer)

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png')

    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Calculate image dimensions to fit on page
    const imgWidth = pdfWidth - 20 // 10mm margins
    const imgHeight = (canvas.height / canvas.width) * imgWidth

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)

    // Add additional pages if needed
    let yPosition = 10 + imgHeight
    if (yPosition > pdfHeight - 10) {
      pdf.addPage()
      yPosition = 10
    }

    pdf.save(`${filename}.pdf`)
  } catch (err) {
    console.error('PDF export failed:', err)
    throw new Error('PDF export failed. Please try again.')
  }
}

/**
 * Export a card element as a PNG file
 * PRIVACY: Local export only, no server transmission
 * @param {HTMLElement} cardElement - The DOM element to capture
 * @param {string} filename - The filename for the PNG (without extension)
 * @returns {Promise<void>}
 */
export async function exportCardToPNG(cardElement, filename) {
  try {
    const exportContainer = createExportContainer(cardElement)
    document.body.appendChild(exportContainer)

    // Wait a moment for all elements to render
    await new Promise(resolve => setTimeout(resolve, 100))

    // Capture with optimized settings
    const canvas = await html2canvas(exportContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 600,
      windowHeight: 1200,
      allowTaint: true,
      onclone: (clonedDocument) => {
        console.log('html2canvas cloned document')
      },
    })

    document.body.removeChild(exportContainer)

    // Convert canvas to PNG and trigger download
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `${filename}.png`
    link.click()
  } catch (err) {
    console.error('PNG export failed:', err)
    throw new Error('PNG export failed. Please try again.')
  }
}
