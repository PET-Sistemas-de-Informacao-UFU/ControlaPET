package br.ufu.facom.petsi.controlaPET.config;

import java.net.URI;
import java.util.Base64;
import java.util.List;

import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

@Configuration
@Profile("prod")
public class ProductionConfiguration {
    @Bean
    static BeanFactoryPostProcessor validateProductionEnvironment(Environment env) {
        return beanFactory -> {
            for (String name : List.of("DB_URL_CONTROLAPET", "DB_USER_CONTROLAPET", "DB_PASSWORD_CONTROLAPET",
                    "JWT_SECRET_CONTROLAPET", "FRONTEND_URL", "CORS_ALLOWED_ORIGINS", "MAIL_HOST",
                    "MAIL_USERNAME", "MAIL_PASSWORD")) {
                if (env.getProperty(name, "").isBlank()) {
                    throw new IllegalStateException("Variavel obrigatoria de producao ausente ou vazia: " + name);
                }
            }
            try {
                byte[] key = Base64.getDecoder().decode(env.getRequiredProperty("JWT_SECRET_CONTROLAPET"));
                if (key.length < 32 || env.getRequiredProperty("JWT_SECRET_CONTROLAPET")
                        .equals("Y2hhdmUtcGFkcmFvLWxvY2FsLXBldC1pbnZlbnRhcmlvLWRldg==")) {
                    throw new IllegalArgumentException();
                }
            } catch (IllegalArgumentException ex) {
                throw new IllegalStateException("JWT_SECRET_CONTROLAPET deve ser uma chave base64 propria de pelo menos 32 bytes.");
            }
            validateHttpsUrl(env.getRequiredProperty("FRONTEND_URL"), "FRONTEND_URL", false);
            for (String origin : env.getRequiredProperty("CORS_ALLOWED_ORIGINS").split(",", -1)) {
                validateHttpsUrl(origin.trim(), "CORS_ALLOWED_ORIGINS", true);
            }
        };
    }

    private static void validateHttpsUrl(String value, String name, boolean originOnly) {
        try {
            URI uri = URI.create(value);
            if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null || uri.getUserInfo() != null
                    || uri.getQuery() != null || uri.getFragment() != null
                    || (originOnly && !uri.getRawPath().isEmpty())) {
                throw new IllegalArgumentException();
            }
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException(name + " deve conter endereco HTTPS valido" + (originOnly ? " sem caminho" : "") + ".");
        }
    }
}
