<template>
	<q-layout view="lHh Lpr lFf">
		<q-drawer
			v-model="leftDrawerOpen"
			show-if-above
			bordered
			class="column"
			:width="isExpanded ? 280 : 85"
			style="transition: width 0.3s;"
			@mouseenter="isExpanded = true"
			@mouseleave="handleMouseLeave"
		>
			<q-item-label header>
				<div class="q-mt-md q-mb-md row justify-center">
					<img
						:src="isExpanded ? logo : logoCurta"
						:style="{ width: isExpanded ? '70%' : '70%' }"
					/>
				</div>
			</q-item-label>

			<q-separator/>

			<q-list class="col q-pa-sm q-mt-sm">
				<!-- MENU COM SUBMENU -->
				<template v-for="link in essentialLinks">
					<!-- COM FILHOS -->
					<q-expansion-item
						v-if="link.children"
						:key="`${link.title}-group`"
						:icon="link.icon"
						:label="isExpanded ? link.title : ''"
						dense
						header-class="menu-expansion"
						v-model="link.expanded"
					>
						<div class="q-ml-md">
							<template v-for="child in link.children">
								<q-expansion-item
									v-if="child.children"
									:key="child.title"
									:icon="child.icon"
									:label="child.title"
									dense
									header-class="menu-expansion"
									v-model="child.expanded"
								>
									<div class="q-ml-md">
										<EssentialLink
											v-for="grandChild in child.children"
											:key="grandChild.title"
											v-bind="grandChild"
											:isExpanded="true"
										/>
									</div>
								</q-expansion-item>

								<EssentialLink
									v-else
									:key="`${child.title}-item`"
									v-bind="child"
									:isExpanded="isExpanded"
								/>
							</template>
						</div>
					</q-expansion-item>

					<!-- SEM FILHOS -->
					<EssentialLink
						v-else
						:key="`${link.title}-item`"
						v-bind="link"
						:isExpanded="isExpanded"
					/>
				</template>
			</q-list>

			<q-spacer />

			<q-separator class="q-mb-sm" />

			<!-- RODAPÉ -->
			<div class="q-pa-sm q-ml-md">
				<div class="row items-center q-gutter-sm">
					<q-icon name="person" size="35px" />

					<div v-if="isExpanded">
						<div class="text-weight-medium">Robison Andrade</div>
						<div class="text-caption text-grey">
							admin@medicare.com
						</div>
					</div>
				</div>

				<div v-if="isExpanded" class="text-caption q-mt-sm text-grey row justify-end">
					Versão 1.0.0
				</div>
			</div>
		</q-drawer>

		<q-page-container>
			<router-view />
		</q-page-container>
	</q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'src/components/EssentialLink.vue'
import logo from 'src/shared-components/src/assets/imgs/logo.png'
import logoCurta from 'src/shared-components/src/assets/imgs/logo2.png'

const isExpanded = ref(false)

const essentialLinks = ref([
	{
		title: 'Prontuário Médico',
		icon: 'medical_information',
	},
	{
		title: 'Agendamento',
		icon: 'calendar_month',
	},
	{
		title: 'Atendimento',
		icon: 'medical_services',
	},
	{
		title: 'Controle Financeiro',
		icon: 'account_balance',
	},
	{
		title: "Pacientes",
		icon: "people",
	},
	{
		title: 'Indicadores',
		icon: 'analytics',
		expanded: false,
		children: [
			{
				title: 'Agendamentos',
				icon: 'person',
				link: '/cadastro-usuarios'
			},
			{
				title: 'Atendimentos',
				icon: 'inventory',
			},
			{
				title: 'Faturamento',
				icon: 'inventory',
			},
		]
	},
	{
		title: 'Gerencial',
		icon: 'settings',
		expanded: false,
		children: [
			{
				title: 'Cadastros Globais',
				icon: 'language',
				expanded: false,
				children: [
					{
						title: 'Usuários',
						icon: 'badge',
						link: '/cadastro-usuarios'
					}
				]
			},
			{
				title: 'Cadastros de Agendamento',
				icon: 'calendar_month',
				expanded: false,
				children: [
					{
						title: 'Tipos de Consulta',
						icon: 'sym_o_article_shortcut',
						link: '/cadastro-tipos-consulta'
					},
					{
						title: 'Parâmetros de Agenda',
						icon: 'sym_o_event_available',
						link: '/cadastro-parametros-agenda'
					}

				]
			},
		]
	}
])

const leftDrawerOpen = ref(true)

function handleMouseLeave() {
  isExpanded.value = false

  // fecha todos os submenus
  essentialLinks.value.forEach(link => {
    if (link.children) {
      link.expanded = false

	  link.children.forEach(child => {
		if (child.children) {
		  child.expanded = false
		}
	  })
    }
  })
}


</script>

<style scoped>
	:deep(.menu-expansion .q-item__section--avatar .q-icon) {
		font-size: 35px;
		color: #212121;
	}

	:deep(.menu-expansion .q-item__label) {
		color: #212121;
	}
</style>

