use std::process::Child;
use std::sync::{Arc, Mutex};
use std::time::Instant;

pub struct ServerProcess {
    pub child: Child,
    pub start_time: Instant,
}

pub struct ServerState {
    pub process: Option<ServerProcess>,
    pub log_lines: Vec<String>,
}

impl Default for ServerState {
    fn default() -> Self {
        Self {
            process: None,
            log_lines: Vec::new(),
        }
    }
}

impl ServerState {
    pub fn is_running(&self) -> bool {
        self.process.is_some()
    }

    pub fn pid(&self) -> Option<u32> {
        self.process.as_ref().map(|p| p.child.id())
    }

    pub fn uptime_secs(&self) -> Option<u64> {
        self.process
            .as_ref()
            .map(|p| p.start_time.elapsed().as_secs())
    }

    pub fn push_log(&mut self, line: String) {
        const MAX_LOG_LINES: usize = 10_000;
        if self.log_lines.len() >= MAX_LOG_LINES {
            self.log_lines.drain(0..1000);
        }
        self.log_lines.push(line);
    }
}

pub type AppState = Arc<Mutex<ServerState>>;
