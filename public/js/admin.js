// react to a click on the Delet button
const deleteProduct = async (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    const productElement = btn.closest('article');
    
    try {
        const result = await fetch('/admin/product/' + prodId, {
            method: 'DELETE',
            headers: {
                'csrf-token': csrf
            }
        })
        if (result.status === 200) {
            productElement.parentNode.removeChild(productElement);
        }
    } catch (err) {
        console.log(err);
    }
}