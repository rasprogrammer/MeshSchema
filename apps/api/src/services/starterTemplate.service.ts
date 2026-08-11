import { starterTemplateRepository } from "@/repositories/starterTemplate.repository";


export const staterTemplateService = {
    list() {
        return starterTemplateRepository.findAll();
    }
};