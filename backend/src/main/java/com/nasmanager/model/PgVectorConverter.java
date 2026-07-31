package com.nasmanager.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.postgresql.util.PGobject;
import java.sql.SQLException;

@Converter
public class PgVectorConverter implements AttributeConverter<String, Object> {

    @Override
    public Object convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            PGobject pgObject = new PGobject();
            pgObject.setType("vector");
            pgObject.setValue(attribute);
            return pgObject;
        } catch (SQLException e) {
            throw new IllegalArgumentException("Error converting String to pgvector PGobject", e);
        }
    }

    @Override
    public String convertToEntityAttribute(Object dbData) {
        if (dbData == null) {
            return null;
        }
        if (dbData instanceof PGobject) {
            return ((PGobject) dbData).getValue();
        }
        return dbData.toString();
    }
}
