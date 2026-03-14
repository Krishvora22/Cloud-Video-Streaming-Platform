# StreamFlix – Cloud Video Streaming Platform

**StreamFlix** is a full-stack video streaming platform inspired by Netflix, designed to deliver **high-performance adaptive video streaming** with a modern user interface.  
The platform focuses on providing **smooth playback, minimal buffering, and dynamic video quality adjustment** based on the user’s internet speed.

The application is built using **Next.js, TypeScript, Tailwind CSS, Node.js, Express, Prisma, and AWS services**, creating a scalable and production-ready streaming system.

StreamFlix allows users to **browse, watch, and manage video content** while maintaining a seamless streaming experience through **HLS (HTTP Live Streaming)** technology.

The platform is designed with **performance, scalability, and user experience** in mind, making it suitable for large-scale streaming applications.

---

# Key Features

### Adaptive Video Streaming
StreamFlix uses **HLS (HTTP Live Streaming)** to automatically adjust video quality based on network conditions.  
If the user's internet speed drops, the video quality lowers automatically to prevent buffering, and increases again when the connection improves.

### Smooth Playback Experience
The player is optimized to ensure **low latency playback** with minimal buffering. The streaming pipeline processes videos into multiple resolutions so that users always receive the best possible quality.

### Secure Authentication
Users can securely create accounts and log in using **JWT-based authentication**, ensuring protected access to the platform.

### Video Library
The platform displays a collection of videos organized into **scrollable rows**, similar to modern streaming platforms. Users can easily browse through available content.

### Featured Content
A **hero banner section** highlights a featured video on the home page, improving content discovery and engagement.

### Personal Watch History
The system tracks user viewing progress, allowing users to **resume videos from where they left off**.

### Watchlist Management
Users can add videos to their **personal watchlist** to view later, providing a personalized viewing experience.

### Subscription Plans
The platform includes **multiple subscription plans** with integrated payment processing, enabling users to choose a plan and access premium content.

### Responsive User Interface
The application is built with a **mobile-first responsive design**, ensuring smooth usability across desktops, tablets, and smartphones.

### Modern Streaming UI
The interface follows a **Netflix-inspired dark theme**, providing a visually appealing and immersive viewing experience.

---

# Technologies Used

- **Frontend:** Next.js, TypeScript, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **Database:** Prisma ORM  
- **Video Streaming:** HLS (HTTP Live Streaming)  
- **Payments:** Stripe Integration  
- **Cloud Storage:** AWS S3  
- **Authentication:** JWT  

---

# Project Goal

The goal of StreamFlix is to demonstrate how modern cloud technologies and streaming protocols can be combined to build a **scalable video streaming platform**.

The project focuses on solving key streaming challenges such as:

- Reducing buffering
- Delivering adaptive video quality
- Handling user subscriptions
- Providing a responsive and modern UI
- Managing video playback progress

By implementing these features, StreamFlix showcases the architecture and functionality required to build a **real-world OTT streaming platform similar to Netflix or Prime Video**.