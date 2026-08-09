# Wyzuk Cast 📺

<div align="center">

  <img src="https://raw.githubusercontent.com/wyzuk/wyzukcast/main/index.html" alt="Wyzuk Cast Logo" width="96" height="96" style="display:none;" />

  # ⚡ Wyzuk Cast
  ### Modern, High-Performance IPTV Web Streaming Player

  [![Watch Live](https://img.shields.io/badge/▶%20WATCH%20LIVE%20STREAM-00f2fe?style=for-the-badge&logoColor=000&labelColor=10141d)](https://wyzukcast.vercel.app/)
  [![GitHub stars](https://img.shields.io/github/stars/wyzuk/wyzukcast?style=for-the-badge&color=4facfe&labelColor=10141d)](https://github.com/wyzuk/wyzukcast/stargazers)
  [![GitHub forks](https://img.shields.io/github/forks/wyzuk/wyzukcast?style=for-the-badge&color=00f2fe&labelColor=10141d)](https://github.com/wyzuk/wyzukcast/network/members)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&labelColor=10141d&color=4facfe)](LICENSE)
  [![Deployed on Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&labelColor=10141d)](https://wyzukcast.vercel.app/)

  <p align="center">
    <strong>An open-source, Apple-inspired IPTV web streaming application designed for speed, beauty, and seamless live television playback.</strong>
  </p>

  <p align="center">
    <a href="https://wyzukcast.vercel.app/"><strong>Explore Live App »</strong></a>
    &nbsp;•&nbsp;
    <a href="#-about-us"><strong>About Us</strong></a>
    &nbsp;•&nbsp;
    <a href="#-features"><strong>Features</strong></a>
    &nbsp;•&nbsp;
    <a href="#-keyboard-shortcuts"><strong>Shortcuts</strong></a>
    &nbsp;•&nbsp;
    <a href="#-getting-started"><strong>Quick Start</strong></a>
    &nbsp;•&nbsp;
    <a href="#-connect-with-us"><strong>Community</strong></a>
  </p>

</div>

---

## 📖 About Us

Welcome to **Wyzuk Cast** — an open-source media streaming initiative founded and maintained by **[Wyzuk](https://github.com/wyzuk)**. 

### 🌟 Who We Are
We are passionate developers, open-source enthusiasts, and digital media advocates dedicated to crafting elegant, ultra-responsive, and accessible web experiences. We believe that accessing live global television, news, entertainment, and educational broadcasts should be simple, lightweight, and free from intrusive ads, bloated client software, or paywalls.

### 🎯 Our Mission
Our mission with **Wyzuk Cast** is to deliver a best-in-class, browser-native IPTV player that combines cutting-edge web streaming technology (`HLS.js`) with an Apple-inspired glassmorphic aesthetic. We want to empower anyone with an internet connection to discover, organize, and enjoy live channels from around the world without needing to install proprietary apps or third-party plugins.

### 💎 Core Values & Philosophy
- **🚀 Zero-Friction Streaming**: Instant startup times, client-side M3U playlist parsing, and automatic playback recovery.
- **🎨 Premium Craftsmanship**: Clean dark mode, glowing cyan-blue accents, smooth micro-interactions, and accessible typography powered by *Plus Jakarta Sans*.
- **🌐 Open Source & Community-Driven**: Transparent codebase, welcoming contributions, and community playlist updates.
- **🔒 Privacy First**: No invasive trackers, no user telemetry, and no account requirements — your streaming session stays strictly on your device.

---

## ✨ Features

- **⚡ Native HLS Live Streaming**: Powered by `HLS.js` for low-latency live streams, buffer management, and automatic error handling.
- **🔍 Instant Channel Search & Filters**: Lightning-fast real-time search across thousands of channels by name or category.
- **🗂️ Dynamic Category Carousel**: Filter effortlessly through News, Sports, Entertainment, Movies, Music, Kids, Regional, and more.
- **🖼️ Picture-in-Picture (PiP) & Fullscreen**: Multitask while watching your favorite channel in a floating window or switch to distraction-free fullscreen mode.
- **⌨️ Power-User Keyboard Navigation**: Comprehensive hotkeys for toggling playback, changing channels, muting audio, and quick search.
- **📱 Fully Responsive Glassmorphic UI**: Tailored for desktops, laptops, tablets, and smartphones with fluid layouts.
- **🔄 Infinite Batch Rendering**: Uses the `IntersectionObserver` API to lazily render channels on-demand, ensuring smooth performance even with huge playlist files.
- **🛡️ Custom Channel Fallbacks**: Smart initials and placeholder avatars for channels without custom logos.

---

## 🎮 Keyboard Shortcuts

Boost your streaming experience with built-in hotkeys:

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| <kbd>Space</kbd> | **Play / Pause** | Toggle video playback for current channel |
| <kbd>F</kbd> | **Fullscreen** | Toggle full-screen player mode |
| <kbd>M</kbd> | **Mute / Unmute** | Toggle audio volume mute |
| <kbd>]</kbd> | **Next Channel** | Switch to the next channel in the list |
| <kbd>[</kbd> | **Previous Channel** | Switch to the previous channel in the list |
| <kbd>/</kbd> | **Quick Search** | Jump directly into the channel search bar |
| <kbd>Esc</kbd> | **Exit Search / Dismiss** | Clear search focus or close active modals |

---

## 🛠️ Tech Stack

Wyzuk Cast is built with clean, modern, zero-bloat web standards:

- **Frontend**: Vanilla HTML5, Modern CSS3 (CSS Custom Properties, Glassmorphism, Flexbox/Grid)
- **Logic**: Vanilla JavaScript (ES6+ Modules, Intersection Observer API, Fullscreen API, PiP API)
- **Streaming Engine**: [HLS.js](https://github.com/video-dev/hls.js)
- **Typography**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) by Google Fonts
- **Deployment & Hosting**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

Follow these steps to run Wyzuk Cast locally on your machine:

### Prerequisites
All you need is a modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Apple Safari, Brave, etc.) and a local web server.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/wyzuk/wyzukcast.git
   cd wyzukcast
   ```

2. **Run a local development server:**
   
   Using **Node.js (npx serve)**:
   ```bash
   npx serve .
   ```

   Or using **Python 3**:
   ```bash
   python -m http.server 3000
   ```

   Or using **VS Code Live Server extension**:
   - Right-click `index.html` and click **"Open with Live Server"**.

3. **Open in browser:**
   - Navigate to `http://localhost:3000` (or the port specified by your local server).

---

## 📋 Custom Playlist Configuration

Wyzuk Cast reads channels from `tv.txt` (a standard M3U / EXTINF playlist format).

To use your own channels or update the playlist:
1. Open `tv.txt` in the root directory.
2. Add your custom channels in standard M3U format:
   ```m3u
   #EXTINF:-1 tvg-logo="https://example.com/logo.png" group-title="News", Channel Name
   https://example.com/live/stream.m3u8
   ```
3. Save the file and reload the application!

---

## 🤝 Contributing & Community

We welcome contributions of all kinds! Whether you want to fix a bug, suggest new features, improve UI accessibility, or help curate working stream sources:

1. **Fork the Project** (`https://github.com/wyzuk/wyzukcast/fork`)
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

If you encounter a broken stream or have an idea, feel free to open an [Issue on GitHub](https://github.com/wyzuk/wyzukcast/issues).

---

## 📬 Connect With Us

- **Developer / Founder**: [Wyzuk](https://github.com/wyzuk)
- **Source Repository**: [github.com/wyzuk/wyzukcast](https://github.com/wyzuk/wyzukcast)
- **Live Application**: [wyzukcast.vercel.app](https://wyzukcast.vercel.app/)

---

## ⚖️ Disclaimer

**Wyzuk Cast** is solely a frontend media player software application. It does not host, store, broadcast, or transmit any proprietary audio or video content directly. All channel streams and metadata are fetched from publicly accessible M3U playlist endpoints provided by the community. 

Please ensure you comply with your local laws and regulations regarding media consumption and intellectual property rights when using any IPTV streaming source.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more details.

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/wyzuk">Wyzuk</a> and contributors worldwide.</sub>
</div>
