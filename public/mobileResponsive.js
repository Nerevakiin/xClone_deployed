document.addEventListener('DOMContentLoaded', () => {
    const videoBtn = document.getElementById('toggle-video-btn');
    const chatBtn = document.getElementById('toggle-chat-btn');
    const videoModal = document.getElementById('videocall');
    const chatModal = document.getElementById('chatroom');

    // Function to close all modals
    function closeAllModals() {
        videoModal.classList.remove('active');
        chatModal.classList.remove('active');
    }

    // Toggle Video Modal
    videoBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent immediate closing
        // If it's already open, close it. If not, close others and open this.
        if (videoModal.classList.contains('active')) {
            videoModal.classList.remove('active');
        } else {
            closeAllModals();
            videoModal.classList.add('active');
        }
    });

    // Toggle Chat Modal
    chatBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (chatModal.classList.contains('active')) {
            chatModal.classList.remove('active');
        } else {
            closeAllModals();
            chatModal.classList.add('active');
        }
    });

    // Optional: Close modals if clicking outside of them (on the background)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1200) {
            const isClickInsideVideo = videoModal.contains(e.target);
            const isClickInsideChat = chatModal.contains(e.target);
            const isClickOnBtn = videoBtn.contains(e.target) || chatBtn.contains(e.target);

            if (!isClickInsideVideo && !isClickInsideChat && !isClickOnBtn) {
                closeAllModals();
            }
        }
    });
});