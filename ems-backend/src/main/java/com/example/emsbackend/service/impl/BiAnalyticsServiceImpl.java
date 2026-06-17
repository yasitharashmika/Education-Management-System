package com.example.emsbackend.service.impl;

import com.example.emsbackend.service.BiAnalyticsService;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@Service
public class BiAnalyticsServiceImpl implements BiAnalyticsService {

    @Override
    public String getPythonAnalytics() {
        try {
            // 1. Tell Java to run the Python script
            ProcessBuilder processBuilder = new ProcessBuilder("python", "src/main/resources/bi/bi_engine.py");
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            // 2. Read the output (the JSON print statement from Python)
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;

            while ((line = reader.readLine()) != null) {
                output.append(line);
            }

            // Wait for the script to finish
            process.waitFor();

            // Return the raw JSON string
            return output.toString();

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"Failed to run BI script\"}";
        }
    }
}