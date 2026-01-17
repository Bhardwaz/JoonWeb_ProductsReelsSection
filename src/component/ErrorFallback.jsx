import React from "react";

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f8fafc, #eef2ff)",
    padding: "24px"
  },

  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "420px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
    animation: "fadeIn 0.3s ease"
  },

  icon: {
    fontSize: "48px",
    marginBottom: "12px"
  },

  title: {
    margin: "0 0 8px",
    fontSize: "22px",
    fontWeight: 600,
    color: "#111827"
  },

  text: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "20px",
    lineHeight: 1.5
  },

  button: {
    background: "#111827",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500
  }
};


class ErrorFallback extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <div style={styles.icon}>🚧</div>

            <h2 style={styles.title}>Something went wrong</h2>

            <p style={styles.text}>
              Don’t worry — this is on us. Please refresh the page or try again.
            </p>

            <button style={styles.button} onClick={this.handleReload}>
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorFallback;
