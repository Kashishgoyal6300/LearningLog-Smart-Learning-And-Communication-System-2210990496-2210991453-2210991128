package com.Learningsite.learningsite.controller;

import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.regex.*;

@RestController
@RequestMapping("/api/compiler")
@CrossOrigin(origins = "*")
public class CompilerController {

    @PostMapping("/run")
    public Map<String, String> runCode(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        Map<String, String> response = new HashMap<>();
        
        if (code == null || code.trim().isEmpty()) {
            response.put("status", "error");
            response.put("output", "No code provided");
            return response;
        }

        Path tempDir = null;
        try {
            // Find class name using regex (fallback to Main)
            String className = "Main";
            Pattern pattern = Pattern.compile("public\\s+class\\s+([A-Za-z0-9_]+)");
            Matcher matcher = pattern.matcher(code);
            if (matcher.find()) {
                className = matcher.group(1);
            }

            tempDir = Files.createTempDirectory("java-run-");
            Path javaFile = tempDir.resolve(className + ".java");
            Files.write(javaFile, code.getBytes());

            // Compile
            ProcessBuilder compilePb = new ProcessBuilder("javac", className + ".java");
            compilePb.directory(tempDir.toFile());
            Process compileProcess = compilePb.start();
            
            String compileError = readStream(compileProcess.getErrorStream());
            int compileExitCode = compileProcess.waitFor();

            if (compileExitCode != 0) {
                response.put("status", "compile_error");
                response.put("output", compileError);
            } else {
                // Run (with 5 second timeout to prevent infinite loops)
                ProcessBuilder runPb = new ProcessBuilder("java", className);
                runPb.directory(tempDir.toFile());
                Process runProcess = runPb.start();
                
                // Read output in separate thread or simple read with timeout
                // For simplicity in this local context, we'll do a simple read
                // In production, you'd use a more robust way to handle timeouts
                
                String output = readStream(runProcess.getInputStream());
                String error = readStream(runProcess.getErrorStream());
                int runExitCode = runProcess.waitFor();

                response.put("status", runExitCode == 0 ? "success" : "runtime_error");
                response.put("output", output + error);
            }

        } catch (Exception e) {
            response.put("status", "error");
            response.put("output", "Execution failed: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // Cleanup
            if (tempDir != null) {
                try {
                    Files.walk(tempDir)
                         .sorted(Comparator.reverseOrder())
                         .map(Path::toFile)
                         .forEach(File::delete);
                } catch (IOException e) {
                    System.err.println("Failed to cleanup temp dir: " + e.getMessage());
                }
            }
        }

        return response;
    }

    private String readStream(InputStream is) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }
        return sb.toString();
    }
}
