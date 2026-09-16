export type VeiculoTipoOption = {
    label: string;
    value: string;
};

/** Common vehicle types for registration comboboxes (value stored as lowercase slug). */
export const VEICULO_TIPO_OPTIONS: VeiculoTipoOption[] = [
    { label: "Carro", value: "carro" },
    { label: "Moto", value: "moto" },
    { label: "Caminhonete", value: "caminhonete" },
    { label: "Van", value: "van" },
    { label: "SUV", value: "suv" },
    { label: "Caminhão", value: "caminhao" },
    { label: "Ônibus", value: "onibus" },
    { label: "Outro", value: "outro" }
];
