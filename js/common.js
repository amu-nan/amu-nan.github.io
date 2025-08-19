document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.querySelector('.back-btn');
    const endDemoBtn = document.querySelector('.end-demo-btn');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            history.back();
        });
    }

    if (endDemoBtn) {
        endDemoBtn.addEventListener('click', () => {
            // Clear local storage and go back to the splash page
            localStorage.removeItem('orgName');
            localStorage.removeItem('ownerName');
            window.location.href = '../index.html';
        });
    }
});
