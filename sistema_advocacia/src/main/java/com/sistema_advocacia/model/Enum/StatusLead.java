package com.sistema_advocacia.model.Enum;

public enum StatusLead {
    Em_triagem(1),
    Emergencia_max(2),
    Aguardando_retorno(3),
    Contrato_fechado(4),
    Encerrado(5);

    private final int idFrontend;

    StatusLead(int idFrontend) {
        this.idFrontend = idFrontend;
    }

    public static StatusLead fromId(int id) {
        for (StatusLead status : values()) {
            if (status.idFrontend == id) {
                return status;
            }
        }
        throw new IllegalArgumentException("ID de status inválido: " + id);
    }

    public int getIdFrontend() {
        return idFrontend;
    }
}